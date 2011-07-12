function NoClickDelay(el) {
	this.element = el;
	if( window.Touch ) this.element.addEventListener('touchstart', this, false);
}

NoClickDelay.prototype = {
	handleEvent: function(e) {
		switch(e.type) {
			case 'touchstart': this.onTouchStart(e); break;
			case 'touchmove': this.onTouchMove(e); break;
			case 'touchend': this.onTouchEnd(e); break;
		}
	},

	onTouchStart: function(e) {
		e.preventDefault();
		this.moved = false;

		this.element.addEventListener('touchmove', this, false);
		this.element.addEventListener('touchend', this, false);
	},

	onTouchMove: function(e) {
		this.moved = true;
	},

	onTouchEnd: function(e) {
		this.element.removeEventListener('touchmove', this, false);
		this.element.removeEventListener('touchend', this, false);

		if( !this.moved ) {

			// Place your code here or use the click simulation below
			var theTarget = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
			if(theTarget.nodeType == 3) theTarget = theTarget.parentNode;

			var theEvent = document.createEvent('MouseEvents');
			theEvent.initEvent('click', true, true);
			theTarget.dispatchEvent(theEvent);
		}
	}
};
new NoClickDelay(document.getElementById('main'));

var indexh = 0,
    indexv = 0,
    triggerElementID = null, // this variable is used to identity the triggering element
    fingerCount = 0,
    startX = 0,
    startY = 0,
    curX = 0,
    curY = 0,
    deltaX = 0,
    deltaY = 0,
    horzDiff = 0,
    vertDiff = 0,
    minLength = 72, // the shortest distance the user may swipe
    swipeLength = 0,
    swipeAngle = null,
    swipeDirection = null,
    timer = null,
    idle = null,
    stopAutoSlideFlag = 0,

    startupTime = 20000,
    slideInterval = 30000,
    idleTime = 30000;


/**
 * Activates the main program logic.
 */
function initialize() {

    document.addEventListener('keydown', onDocumentKeyDown, false);
    //document.addEventListener('touchstart', onDocumentTouchStart, false);
    document.addEventListener('touchstart', touchStart, false);
    document.addEventListener('touchend', touchEnd, false);
    document.addEventListener('touchmove', touchMove, false);
    document.addEventListener('touchcancel', touchCancel, false);
    window.addEventListener('hashchange', onWindowHashChange, false);

    // Read the initial state of the URL (hash)
    readURL();
}

/**
 * Handler for the document level 'keydown' event.
 *
 * @param {Object} event
 */
function onDocumentKeyDown( event ) {

    if( event.keyCode >= 37 && event.keyCode <= 40 ) {

        switch( event.keyCode ) {
            case 37: navigateLeft(); break; // left
            case 39: navigateRight(); break; // right
            case 38: navigateUp(); break; // up
            case 40: navigateDown(); break; // down
        }

        slide();

        event.preventDefault();

    }
}

/**
 * Handler for the document level 'touchstart' event.
 *
 * This enables very basic tap interaction for touch
 * devices. Added mainly for performance testing of 3D
 * transforms on iOS but was so happily surprised with
 * how smoothly it runs so I left it in here. Apple +1
 *
 * @param {Object} event
 */
function onDocumentTouchStart( event ) {

    // We're only interested in one point taps
    if (event.touches.length == 1) {
        event.preventDefault();

        var point = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };

        // Define the extent of the areas that may be tapped
        // to navigate
        var wt = window.innerWidth * 0.4;
        var ht = window.innerHeight * 0.4;

        if( point.x < wt ) {
            navigateLeft();
        }
        else if( point.x > window.innerWidth - wt ) {
            navigateRight();
        }
        else if( point.y < ht ) {
            navigateUp();
        }
        else if( point.y > window.innerHeight - ht ) {
            navigateDown();
        }

        slide();

    }
}

function touchStart(event,passedName) {
    fingerMoved = false;
    // disable the standard ability to select the touched object
    event.preventDefault();
    // get the total number of fingers touching the screen
    fingerCount = event.touches.length;
    // since we're looking for a swipe (single finger) and not a gesture (multiple fingers),
    // check that only one finger was used
    if ( fingerCount == 1 ) {
        // get the coordinates of the touch
        startX = event.touches[0].pageX;
        startY = event.touches[0].pageY;
        // store the triggering element ID
        triggerElementID = passedName;
    } else {
        // more than one finger touched so cancel
        touchCancel(event);
    }
}

function touchMove(event) {
    fingerMoved = true;
    event.preventDefault();
    if ( event.touches.length == 1 ) {
        curX = event.touches[0].pageX;
        curY = event.touches[0].pageY;
    } else {
        touchCancel(event);
    }
}

function touchEnd(event) {
    event.preventDefault();

    // check to see if more than one finger was used and that there is an ending coordinate
    if ( fingerCount == 1 && curX != 0 ) {
        // use the Distance Formula to determine the length of the swipe
        swipeLength = Math.round(Math.sqrt(Math.pow(curX - startX,2) + Math.pow(curY - startY,2)));
        // if the user swiped more than the minimum length, perform the appropriate action
        if ( swipeLength >= minLength ) {
            caluculateAngle();
            determineSwipeDirection();
            processingRoutine();
            touchCancel(event); // reset the variables
        } else {
            touchCancel(event);
        }
    } else {
        touchCancel(event);
    }
}

function touchCancel(event) {
    // reset the variables back to default values
    fingerCount = 0;
    startX = 0;
    startY = 0;
    curX = 0;
    curY = 0;
    deltaX = 0;
    deltaY = 0;
    horzDiff = 0;
    vertDiff = 0;
    swipeLength = 0;
    swipeAngle = null;
    swipeDirection = null;
    triggerElementID = null;
}

function caluculateAngle() {
    var X = startX-curX;
    var Y = curY-startY;
    var Z = Math.round(Math.sqrt(Math.pow(X,2)+Math.pow(Y,2))); //the distance - rounded - in pixels
    var r = Math.atan2(Y,X); //angle in radians (Cartesian system)
    swipeAngle = Math.round(r*180/Math.PI); //angle in degrees
    if ( swipeAngle < 0 ) { swipeAngle =  360 - Math.abs(swipeAngle); }
}

function determineSwipeDirection() {
    if ( (swipeAngle <= 45) && (swipeAngle >= 0) ) {
        swipeDirection = 'left';
    } else if ( (swipeAngle <= 360) && (swipeAngle >= 315) ) {
        swipeDirection = 'left';
    } else if ( (swipeAngle >= 135) && (swipeAngle <= 225) ) {
        swipeDirection = 'right';
    } else if ( (swipeAngle > 45) && (swipeAngle < 135) ) {
        swipeDirection = 'down';
    } else {
        swipeDirection = 'up';
    }
}

function processingRoutine() {
    clearTimeout(startslide);
    if (!stopAutoSlideFlag) stopAutoSlide();
    idleTimer();
    var swipedElement = document.getElementById(triggerElementID);

    if ( swipeDirection == 'left' ) {
        navigateRight();

    } else if ( swipeDirection == 'right' ) {
        navigateLeft();

    } else if ( swipeDirection == 'up' ) {
        navigateDown();

    } else if ( swipeDirection == 'down' ) {
        navigateUp();
    }
}

/**
 * Handler for the window level 'hashchange' event.
 *
 * @param {Object} event
 */
function onWindowHashChange( event ) {
    readURL();
}

/**
 * Updates one dimension of slides by showing the slide
 * with the specified index.
 *
 * @param {String} selector A CSS selector that will fetch
 * the group of slides we are working with
 * @param {Number} index The index of the slide that should be
 * shown
 *
 * @return {Number} The index of the slide that is now shown,
 * might differ from the passed in index if it was out of
 * bounds.
 */
function updateSlides( selector, index ) {

    // Select all slides and convert the NodeList result to
    // an array
    var slides = Array.prototype.slice.call( document.querySelectorAll( selector ) );

    if( slides.length ) {
        // Enforce max and minimum index bounds
        index = Math.max(Math.min(index, slides.length - 1), 0);

        slides[index].setAttribute('class', 'present');

        // Any element previous to index is given the 'past' class
        slides.slice(0, index).map(function(element){
            element.setAttribute('class', 'past');
        });

        // Any element subsequent to index is given the 'future' class
        slides.slice(index + 1).map(function(element){
            element.setAttribute('class', 'future');
        });
    }
    else {
        // Since there are no slides we can't be anywhere beyond the
        // zeroth index
        index = 0;
    }
    return index;

}

/**
 * Updates the visual slides to represent the currently
 * set indices.
 */
function slide() {
    //alert(indexh);
    indexh = updateSlides( '#main>section', indexh );
    indexv = updateSlides( 'section.present>section', indexv );
    //alert(indexh);
    writeURL();
}

/**
 * Reads the current URL (hash) and navigates accordingly.
 */
function readURL() {
    // Break the hash down to separate components
    var bits = window.location.hash.slice(2).split('/');

    // Read the index components of the hash
    indexh = bits[0] ? parseInt( bits[0] ) : 0;
    indexv = bits[1] ? parseInt( bits[1] ) : 0;

    navigateTo( indexh, indexv );
}

/**
 * Updates the page URL (hash) to reflect the current
 * navigational state.
 */
function writeURL() {
    var url = '/';

    // Only include the minimum possible number of components in
    // the URL
    if( indexh > 0 || indexv > 0 ) url += indexh
    if( indexv > 0 ) url += '/' + indexv

    window.location.hash = url;
}

/**
 * Triggers a navigation to the specified indices.
 *
 * @param {Number} h The horizontal index of the slide to show
 * @param {Number} v The vertical index of the slide to show
 */
function navigateTo( h, v ) {
    indexh = h === undefined ? indexh : h;
    indexv = v === undefined ? indexv : v;

    slide();
}

function navigateLeft() {
    var slides = Array.prototype.slice.call( document.querySelectorAll( '#main>section' ) );
    if (!indexh) indexh = slides.length;
    indexh --;
    indexv = 0;
    slide();
}
function navigateRight() {
    var slides = Array.prototype.slice.call( document.querySelectorAll( '#main>section' ) );
    var end = 0;
    if ( indexh == slides.length - 1) {
        indexh = 0;
        end = 1;
    }
    if ( !end ) indexh ++;
    indexv = 0;
    slide();
}
function navigateUp() {
    indexv --;
    slide();
}
function navigateDown() {
    indexh = 0;
    indexv = 1;
    //indexv ++;
    slide();
}

function slideTimer() {
    timer = setTimeout("slideTimer()", slideInterval);
    navigateRight();
}
function startAutoSlide() {
    clearTimeout(timer);
    stopAutoSlideFlag = 0;
    slideTimer();
}
function stopAutoSlide() {
    clearTimeout(timer);
}
function idleTimer() {
        stopAutoSlideFlag = 1;
        clearTimeout(idle);
        clearTimeout(timer);
        idle = setTimeout("startAutoSlide();", idleTime);
}

// Initialize the program. Done right before returning to ensure
// that any inline variable definitions are available to all
// functions
initialize();
var startslide = setTimeout("startAutoSlide()", startupTime);