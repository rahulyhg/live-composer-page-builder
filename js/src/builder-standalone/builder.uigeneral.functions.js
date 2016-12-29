/*********************************
 *
 * = UI - GENERAL =
 *
 * - dslc_hide_composer ( Hides the composer elements )
 * - dslc_show_composer ( Shows the composer elements )
 * - dslc_show_publish_button ( Shows the publish button )
 * - dslc_show_section ( Show a specific section )
 * - dslc_generate_filters ( Generate origin filters )
 * - dslc_filter_origin ( Origin filtering for templates/modules listing )
 * - dslc_drag_and_drop ( Initiate drag and drop functionality )
 ***********************************/

'use strict';

/**
 * Try to detect JS errors in WP Admin part.
 */
 window.onerror = function( error, file, line, char ) {

	dslca_generate_error_report ( error, file, line, char );
}

/**
 * Hook - Open Error Log button
 */
jQuery(document).on( 'click', '.dslca-show-js-error-hook', function(e){

	e.preventDefault();

	var errors_container = document.getElementById('dslca-js-errors-report');

	if ( ! jQuery('body').hasClass('dslca-saving-in-progress') ) {

		LiveComposer.Builder.UI.CModalWindow({

			title: '<a href="https://livecomposerplugin.com/support/support-request/" target="_blank"><span class="dslca-icon dslc-icon-comment"></span> &nbsp; Open Support Ticket</a>',
			content: '<span class="dslca-error-report">' + errors_container.value + '</span>',
		});
	}
});


/**
 * UI - GENERAL - Document Ready
 */

jQuery(document).ready(function($) {
// @todo: move to wp admin area.
	/**
	 * Try to detect JS errors in preview area.
	 */
	/*
	jQuery("#page-builder-frame")[0].contentWindow.onerror = function( error, file, line, char ) {

		dslca_generate_error_report ( error, file, line, char );
	}
	*/

	// Put JS error log data in a hidden textarea.
	dslca_update_report_log();


	jQuery('body').addClass('dslca-enabled dslca-drag-not-in-progress');
	jQuery('.dslca-invisible-overlay').hide();
	jQuery('.dslca-section').eq(0).show();

	/** Wait till tinyMCE loaded */
	// window.previewAreaTinyMCELoaded = function(){

		


	// };
});

/*
	Resizable project todos:

	@todo: Make old code render properly.
	@todo: Re-init resizable once the module moved between areas.
	@todo: Add resize to the module areas.
	@todo: Disable the shrink property if you resize.
 */
LiveComposer.Builder.UI.initResizableModules = function(el) {

	if ( dslcDebug ) console.log( 'initResizableModules' );

	var elementsToResize = jQuery(document).find(".dslc-module-front");

	if ( undefined !== el ) {
		elementsToResize = jQuery(el);
	}

	var gridRuler = document.getElementById('grid-rule');

	// var modules = 	
	elementsToResize.each( function() {

		var thisModuleJQ = jQuery(this);
		var parentRow    = thisModuleJQ.parent();
		var gridRullerCurrent;
		var offsetOriginal = 0;
		var offset = 0;
		var grid = 24;

		// thisModuleJQ.resizable( 'destroy' ); // @todo: check this cause error.

		var resizable = jQuery(this).resizable({

			handles: "e, w", //"n, e, s, w"
			// containment: "parent", // Don't go out of the parent container.

			resize: function(e, ui) { // pas besoin pour l'instant

				/* Grid Offset Detection and Change */
				var jqResizeOffsetPx = ui.position.left;
				var jqResizeOffsetPercent = 100 * ui.position.left / parentRow.innerWidth();

				var oneGridColInPx = parentRow.innerWidth() / 24;
				var attrOffsetCols = this.getAttribute( 'data-lc-offset-large');
				var attrOffsetColsPercent = 100 * ( attrOffsetCols * oneGridColInPx ) / parentRow.innerWidth();


				var cellPercentOffsetParam = jqResizeOffsetPercent;

				// if ( jqResizeOffsetPercent < 0 ) {
				// 	cellPercentOffsetParam = attrOffsetColsPercent + jqResizeOffsetPercent;
				// }

				// if ( cellPercentOffsetParam > 0 ) {

					offset = Math.round( cellPercentOffsetParam / ( 100 / grid ) );

					// var offsetGridArgs = {
					// 	percent: cellPercentOffsetParam,
					// 	obj: this
					// };

					// LiveComposer.Builder.UI.updateOffsetGridAttr(offsetGridArgs);

				// }

				/* Grid Width Detection and Change */

				// jQuery UI has a bug https://bugs.jqueryui.com/ticket/8932
				// We need to compensate paddings to make it work as expected.
				var modulePadding = thisModuleJQ.css('padding-left').replace("px", "");
				ui.size.width = ui.size.width + modulePadding * 2;

				var thisModuleWidth  = ui.size.width;
				var cellPercentWidth = 100 * thisModuleWidth / parentRow.innerWidth();

				/**
				 * Launch the function that manipulates grid CSS classes
				 * based on the current resize offset.
				 */
				var updateGridWidthArgs = {
					percent: cellPercentWidth,
					obj: this
				};

				// Do not change module width if dragging the left side to the 
				// if ( cellOffsetPercent < 0 ) {

					LiveComposer.Builder.UI.updateGridWidthAttr(updateGridWidthArgs);
				// }

				/**
				 * While imitating module resize process with JQuery
				 * we are disabling grid influence on the width.
				 */
				this.style.flex = 'none';
				this.style.maxWidth = 'none';
			},

			stop: function( event, ui ) {
				// Actions to run when users stops resizing.

				/**
				 * Delete inline styles. We use it to imitate the resize process.
				 * Actual width change is happening via CSS class change.
				 */
				this.style = '';

				// Update classes for the current module based on attributes
				offset = parseInt(offsetOriginal) + parseInt(offset);

				if ( offset < 0 ) {
					offset = 0;
				}

				this.setAttribute( 'data-lc-offset-large', offset );
				LiveComposer.Builder.UI.updateOffsetGridClass(this);
				LiveComposer.Builder.UI.updateGridWidthClass(this);

				// Update module size in raw base64 code (dslc_code) of the module
				LiveComposer.Utils.update_module_property_raw( this, 'lc_offset_large', this.getAttribute('data-lc-offset-large') );
				LiveComposer.Utils.update_module_property_raw( this, 'lc_width_large',  this.getAttribute('data-lc-width-large') );

				LiveComposer.Builder.PreviewAreaWindow.dslc_masonry();

				/**
				 * Regenerate the page code to make sure our changes get saved.
				 */
				dslc_generate_code();
				dslc_show_publish_button();

				jQuery('#grid-rule').remove();
			},

			start: function( event, ui ) {

				if ( dslcDebug ) console.log( 'jQuery UI .resizable - start event' );

				// Set original offset value.
				offsetOriginal = this.getAttribute( 'data-lc-offset-large');

				if ( offsetOriginal === null ) {
					offsetOriginal = 0;
				}

				var parrentRect = parentRow[0].getBoundingClientRect(); 
				gridRullerCurrent = parentRow.prepend( gridRuler.cloneNode(true) );
				jQuery('#grid-rule').css({'display': 'block','width': parentRow.innerWidth() + 'px', 'left': parrentRect.left + 'px', 'top': parrentRect.top + 'px' });
			}
		}); // .resizable
	}); // .each
}

/**
 * [updateGridWidthAttr description]
 * @param  {Object} params  { percent: cellPercentWidth, obj: this, grid: 12/24,};
 * @return {[type]}        [description]
 */
LiveComposer.Builder.UI.updateGridWidthAttr = function(params) {

	if(typeof params != 'object' || this.instancesExists === true) return false;

	var self = this;
 	var gridWidthToApply = LiveComposer.Builder.UI.covertPercentToGrid ( params.percent );

	// Update element data attribute (it has max 12 columns).
	params.obj.setAttribute( 'data-lc-width-large', gridWidthToApply );
}

LiveComposer.Builder.UI.updateGridWidthClass = function(obj) {

	var self = this;
	var gridWidth = obj.getAttribute('data-lc-width-large');

	// Update element class.
	jQuery(obj).removeClass (function (index, css) {
		return (css.match (/(^|\s)lc-small-\S+/g) || []).join(' ');
	});

	jQuery(obj).addClass( 'lc-small-' + gridWidth );
}

/**
 * ----------------------------------------------------------------------
 * Grid Offset Apply Functions
 */
/*
LiveComposer.Builder.UI.updateOffsetGridAttr = function(params) {

	if(typeof params != 'object' || this.instancesExists === true) return false;

	var self = this;
 	var gridOffsetToApply = LiveComposer.Builder.UI.covertPercentToGrid ( params.percent );

 	console.info( 'offset GRID attr to set:' + gridOffsetToApply );

	// Update element data attribute (it has max 12 columns).
	params.obj.setAttribute( 'data-lc-offset-large', gridOffsetToApply );
}
*/


LiveComposer.Builder.UI.updateOffsetGridClass = function(obj) {

	var self = this;
	var gridOffset = obj.getAttribute('data-lc-offset-large');

	// Update element class.
	jQuery(obj).removeClass (function (index, css) {
		return (css.match (/(^|\s)lc-offset-small-\S+/g) || []).join(' ');
	});

	if ( gridOffset > 0 ) {
		jQuery(obj).addClass( 'lc-offset-small-' + gridOffset );
	}
}

/**
 * ----------------------------------------------------------------------
 */


LiveComposer.Builder.UI.covertPercentToGrid = function( percent ) {

	var self = this;


	var grid = 24;

	// if ( params.grid !== undefined ) {
	// 	grid = params.grid;
	// }

	// 100/12 = 8.3333 - % value for 1 column.
	var grid12SizeToPercent = {
		0: 0,
		1: 8.333,
		2: 16.666,
		3: 24.999,
		4: 33.333,
		5: 41.666,
		6: 49.999,
		7: 58.333,
		8: 66.666,
		9: 74.999,
		10: 83.333,
		11: 91.666,
		12: 100
	};

	// 100/24 = 4.14 - % value for 1 column.
	var grid24SizeToPercent = {
		0: 0,
		1: 4.16,
		2: 8.333,
		3: 12.49,
		4: 16.666,
		5: 20.83,
		6: 24.999,
		7: 29.16,
		8: 33.333,
		9: 37.49,
		10: 41.666,
		11: 45.83,
		12: 49.999,
		13: 54.16,
		14: 58.333,
		15: 62.49,
		16: 66.666,
		17: 70.83,
		18: 74.999,
		19: 79.16,
		20: 83.333,
		21: 87.49,
		22: 91.666,
		23: 95.82,
		24: 100
	};

	var gridArray = grid12SizeToPercent;

	if ( grid === 24 ) {
		gridArray = grid24SizeToPercent;
	}

	var gridWidthValue = Math.round( percent / ( 100 / grid ) );
	// LiveComposer.Builder.Helpers.closest(gridArray, percent);

	return gridWidthValue;
}

/**
 * Find the key in the object with closes value to the provided
 */
LiveComposer.Builder.Helpers.closest = function(obj, closestTo){

	// @todo: recode so var closest = max value in the object.
	var closest = 100; //Set the highest number.
/*
	 for(var i = 0; i < Object.keys(obj).length; i++){ //Loop the array
		  if(obj[i] >= closestTo && obj[i] < closest) closest = obj[i]; //Check if it's higher than your number, but lower than your closest value
	 }
*/
	Object.keys(obj).forEach(function(key,index) {
		// key: the name of the object key
		// index: the ordinal position of the key within the object 

		if( obj[key] >= closestTo && obj[key] < closest ) closest = key; //Check if it's higher than your number, but lower than your closest value
	});

	// If 100% set closest to the proper key
	if ( closest === 100 ) {

		for(var key in obj) {
			 if( obj[key] === 100) {
				 closest = key;
			 }
		}
	}

	return closest; // return the value
}

/**
 * Action - "Currently Editing" scroll on click
 */

jQuery(document).on( 'click', '.dslca-currently-editing', function(){

	var activeElement = false,
	newOffset = false,
	outlineColor;

	if ( jQuery('.dslca-module-being-edited').length ) {

		activeElement = jQuery('.dslca-module-being-edited');
		outlineColor = '#5890e5';

	} else if ( jQuery('.dslca-modules-section-being-edited').length ) {

		activeElement = jQuery('.dslca-modules-section-being-edited');
		outlineColor = '#eabba9';
	}

	if ( activeElement ) {
		newOffset = activeElement.offset().top - 100;
		if ( newOffset < 0 ) { newOffset = 0; }

		var callbacks = [];

		jQuery( 'html, body').animate({ scrollTop: newOffset }, 300, function(){
			activeElement.removeAttr('style');
		});
	}

});

/**
 * Save composer code with CMD+S or Ctrl+S
 */
jQuery(window).keypress( function(e){

	if ((e.metaKey || e.ctrlKey) && e.keyCode == 83) {

		dslc_ajax_save_composer();
		e.preventDefault();
		  return false;
	}
});

/**
 * Hook - Hide Composer
 */

jQuery(document).on( 'click', '.dslca-hide-composer-hook', function(e){

	e.preventDefault();
	dslc_hide_composer()
});

/**
 * Hook - Show Composer
 */

jQuery(document).on( 'click', '.dslca-show-composer-hook', function(e){
	e.preventDefault();
	dslc_show_composer();
});

/**
 * Hook - Section Show - Modules Listing
 */

jQuery(document).on( 'click', '.dslca-go-to-modules-hook', function(e){
	e.preventDefault();
	dslc_show_section( '.dslca-modules' );
});

/**
 * Hook - Section Show - Dynamic
 */

jQuery(document).on( 'click', '.dslca-go-to-section-hook', function(e){

	e.preventDefault();

	// Do nothing if clicked on active tab
	if ( jQuery(this).hasClass('dslca-active') ) {

		return;
	}

	var sectionTitle = jQuery(this).data('section');
	dslc_show_section( sectionTitle );

	if ( jQuery(this).hasClass('dslca-go-to-section-modules') || jQuery(this).hasClass('dslca-go-to-section-templates')  ) {

		jQuery(this).addClass('dslca-active').siblings('.dslca-go-to-section-hook').removeClass('dslca-active');
	}
});

/**
 * Hook - Close Composer
 */

jQuery(document).on( 'click', '.dslca-close-composer-hook', function(e){

	e.preventDefault();

	var redirect_url = jQuery(this).attr('href');

	if ( ! jQuery('body').hasClass('dslca-saving-in-progress') ) {

		LiveComposer.Builder.UI.CModalWindow({

			title: DSLCString.str_exit_title,
			content: DSLCString.str_exit_descr,
			confirm: function() {
				window.location = redirect_url;
			}
		});

		/*dslc_js_confirm( 'disable_lc', '<span class="dslca-prompt-modal-title">' +
			DSLCString.str_exit_title + '</span><span class="dslca-prompt-modal-descr">' + DSLCString.str_exit_descr + '</span>', jQuery(this).attr('href') );*/
	}
});

/**
 * Submit Form
 */

jQuery(document).on( 'click', '.dslca-submit', function(){

	jQuery(this).closest('form').submit();

});

/**
 * Hook - Show Origin Filters
 */

jQuery(document).on( 'click', '.dslca-section-title', function(e){

	e.stopPropagation();

	if ( jQuery('.dslca-section-title-filter', this).length ) {

		dslc_generate_filters();

		// Open filter panel
		jQuery('.dslca-section-title-filter-options').slideToggle(300);
	}
});

/**
 * Hook - Apply Filter Origin
 */

jQuery(document).on( 'click', '.dslca-section-title-filter-options a', function(e){

	e.preventDefault();
	e.stopPropagation();

	var origin = jQuery(this).data('origin');
	var section = jQuery(this).closest('.dslca-section');

	if ( section.hasClass('dslca-templates-load') ) {

		jQuery('.dslca-section-title-filter-curr', section).text( jQuery(this).text());
	} else {

		jQuery('.dslca-section-title-filter-curr', section).text( jQuery(this).text());
	}

	dslc_filter_origin( origin, section );

	// Close filter panel
	jQuery('.dslca-section-title-filter-options').slideToggle(300);
});


/**
 * UI - GENERAL - Hide Composer
 */

function dslc_hide_composer() {

	if ( dslcDebug ) console.log( 'dslc_hide_composer' );

	// Hide "hide" button and show "show" button
	jQuery('.dslca-hide-composer-hook').hide();
	jQuery('.dslca-show-composer-hook').show();

	// Add class to know it's hidden
	jQuery('body').addClass('dslca-composer-hidden');
	jQuery('body').addClass('dslca-composer-hidden');


	// Hide ( animation ) the main composer area ( at the bottom )
	jQuery('.dslca-container').css({ bottom : jQuery('.dslca-container').outerHeight() * -1 });

	// Hide the header  part of the main composer area ( at the bottom )
	jQuery('.dslca-header').hide();

}

/**
 * UI - GENERAL - Show Composer
 */

function dslc_show_composer() {

	if ( dslcDebug ) console.log( 'dslc_show_composer' );

	// Hide the "show" button and show the "hide" button
	jQuery('.dslca-show-composer-hook').hide();
	jQuery('.dslca-hide-composer-hook').show();

	// Remove the class from the body so we know it's not hidden
	jQuery('body').removeClass('dslca-composer-hidden');
	jQuery('body').removeClass('dslca-composer-hidden');


	// Show ( animate ) the main composer area ( at the bottom )
	jQuery('.dslca-container').css({ bottom : 0 });

	// Show the header of the main composer area ( at the bottom )
	jQuery('.dslca-header').show();
}

/**
 * UI - GENERAL - Show Publish Button
 */

function dslc_show_publish_button() {

	if ( dslcDebug ) console.log( 'dslc_show_publish_button' );

	jQuery('.dslca-save-draft-composer').show().addClass('dslca-init-animation');

	//%%%%%%%

	// Create the app object with revision module loaded.
	LCAPP( 'revisions', function(lcApp){
		// Save Code Revision.
		lcApp.revisions.save();
	});
}



function dslc_hide_publish_button() {

	if ( dslcDebug ) console.log( 'dslc_hide_publish_button' );
	jQuery('.dslca-save-draft-composer').hide();
}

/**
 * UI - GENERAL - Show Section
 */

function dslc_show_section( section ) {

	if ( dslcDebug ) console.log( 'dslc_show_section' );

	// Add class to body so we know it's in progress
	// jQuery('body').addClass('dslca-anim-in-progress');

	// Get vars
	var sectionTitle = jQuery(section).data('title'),
	newColor = jQuery(section).data('bg');

	// Hide ( animate ) the container
	jQuery('.dslca-container').css({ bottom: -500 });

	// Hide all sections and show specific section
	jQuery('.dslca-section').hide();
	jQuery(section).show();



	// Change "currently editing"
	if ( section == '.dslca-module-edit' ) {

		jQuery('.dslca-currently-editing')
			.show()
				.find('strong')
				.text( jQuery('.dslca-module-being-edited').attr('title') );
	} else if ( section == '.dslca-modules-section-edit' ) {

		jQuery('.dslca-currently-editing')
			.show()
			.css( 'background-color', '#e5855f' )
				.find('strong')
				.text( 'Row' );
	} else {

		jQuery('.dslca-currently-editing')
			.hide()
				.find('strong')
				.text('');
	}

	// Filter module option tabs
	dslc_module_options_tab_filter();

	// Show ( animate ) the container
	// setTimeout( function() {
		jQuery('.dslca-container').css({ bottom : 0 });
	// }, 300 );

	// Remove class from body so we know it's finished
	// jQuery('body').removeClass('dslca-anim-in-progress');
}

/**
 * UI - GENERAL - Generate Origin Filters
 */

function dslc_generate_filters() {

	if ( dslcDebug ) console.log( 'dslc_generate_filters' );

	// Vars
	var el, filters = [], filtersHTML = '<a html="#" data-origin="">Show All</a>', els = jQuery('.dslca-section:visible .dslca-origin');

	// Go through each and generate the filters
	els.each(function(){
		el = jQuery(this);

		if ( jQuery.inArray( el.data('origin'), filters ) == -1 ) {
			filters.push( el.data('origin') );
			filtersHTML += '<a href="#" data-origin="' + el.data('origin') + '">' + el.data('origin') + '</a>';
		}
	});

	jQuery('.dslca-section:visible .dslca-section-title-filter-options').html( filtersHTML ).css( 'background', jQuery('.dslca-section:visible').data('bg') );
}

/**
 * UI - GENERAL - Origin Filter
 */

function dslc_filter_origin( origin, section ) {

	if ( dslcDebug ) console.log( 'dslc_filter_origin' );

	jQuery('.dslca-origin', section).hide();
	jQuery('.dslca-origin[data-origin="' + origin + '"]', section).show();

	if ( origin == '' ) {
		jQuery('.dslca-origin', section).show();
	}
}


/**
 * UI - General - Initiate Drag and Drop Functonality
 */

function dslc_drag_and_drop() {

	if ( dslcDebug ) console.log( 'dslc_drag_and_drop' );


}

/**
 * Deprecated Functions and Fallbacks
 */

function dslc_option_changed() { dslc_show_publish_button(); }
function dslc_module_dragdrop_init() { dslc_drag_and_drop(); }


/**
 * Prevent drag and drop of the modules
 * into the inner content areas of the other modules
 */
function dslc_fix_contenteditable() {

	jQuery(document).on('dragstart', '.dslca-module, .dslc-module-front, .dslc-modules-area, .dslc-modules-section', function (e) {

		jQuery('[contenteditable]').attr('contenteditable', false);
	});

	jQuery(document).on('dragend mousedown', '.dslca-module, .dslc-module-front, .dslc-modules-area, .dslc-modules-section', function (e) {

		jQuery('[contenteditable]').attr('contenteditable', true);
	});
}

/**
 * Disable/Enable module control.
 *
 * @param  {string} control_id CSS ID of the control we are toggling
 * @return {void}
 */
function dslc_toogle_control ( control_id ) {

	if ( control_id === undefined) control_id = false;
	if ( !control_id ) return;

	var control         = jQuery('.dslca-module-edit-option-' + control_id );
	var control_storage = control.find('.dslca-module-edit-field');

	// Get the element we are editing
	var module = jQuery('.dslca-module-being-edited');

	// Get the element id
	var module_id = module[0].id;

	var responsive_prefix = '';

	if ( 'tablet_responsive' === control.data('tab') ) {
		responsive_prefix = 'body.dslc-res-tablet ';
	} else if ( 'phone_responsive' === control.data('tab') ) {
		responsive_prefix = 'body.dslc-res-phone ';
	}

	var affect_on_change_el = control_storage.data('affect-on-change-el');

	if ( affect_on_change_el === undefined) return;

	var affect_on_change_elmts = affect_on_change_el.split( ',' );

	affect_on_change_el = '';

	// Loop through elements (useful when there are multiple elements)
	for ( var i = 0; i < affect_on_change_elmts.length; i++ ) {

		if ( i > 0 ) {

			affect_on_change_el += ', ';
		}

		affect_on_change_el += responsive_prefix + '#' + module_id + ' ' + affect_on_change_elmts[i];
	}

	var affect_on_change_rule  = control_storage.data('affect-on-change-rule').replace(/ /g,'');
	var affect_on_change_rules = affect_on_change_rule.split( ',' );

	var control_value;
	var control_data_ext = control_storage.data('ext');

	control.toggleClass('dslca-option-off');

	if ( control.hasClass('dslca-option-off')) {
		// Disable

		control_value = dslc_get_control_value(control_id);
		// Temporary backup the current value as data attribute
		control_storage.data( 'val-bckp', control_value );
		// control_value = dslc_combine_value_and_extension( control_value, control_data_ext);

		// Loop through rules (useful when there are multiple rules)
		for ( var i = 0; i < affect_on_change_rules.length; i++ ) {

			// remove css rule in element inline style
			jQuery( affect_on_change_el).css( affect_on_change_rules[i] , '' );
			// remove css rule in css block
			disable_css_rule ( affect_on_change_el, affect_on_change_rules[i], module_id);
			// PROBLEM do not work with multiply rules ex.: .dslc-text-module-content,.dslc-text-module-content p
		}

		control_storage.val('').trigger('change');
	} else {
		// Enable

		// Restore value of the data backup attribute
		control_storage.val( control_storage.data('val-bckp') ).trigger('change');
		control_value = dslc_get_control_value(control_id);
		control_value = dslc_combine_value_and_extension( control_value, control_data_ext || '');

		// Loop through rules (useful when there are multiple rules)
		for ( var i = 0; i < affect_on_change_rules.length; i++ ) {

			var styleContent = affect_on_change_el + "{" + affect_on_change_rules[i] + ": " + control_value + "}";

			LiveComposer.Builder.Helpers.processInlineStyleTag({

				context: control,
				rule: affect_on_change_rules[i],
				elems: affect_on_change_el.replace(new RegExp('#' + module_id, 'gi'), '').trim(),
				styleContent: styleContent
			});
		}
	}
}

jQuery(document).ready(function($){

	// Option Control Toggle
	jQuery(document).on( 'click', '.dslca-module-edit-option .dslc-control-toggle', function(e){

		e.preventDefault();
		var control_id = jQuery(e.target).closest('.dslca-module-edit-option').find('.dslca-module-edit-field').data('id');
		dslc_toogle_control ( control_id );
	});


	// Disable Toggle If the Control Focused
	jQuery(document).on( 'mousedown', '.dslca-module-edit-option', function(e){

		var toggle = $('.dslc-control-toggle');
		if ( ! toggle.is(e.target) // if the target of the click isn't the container...
			  && toggle.has(e.target).length === 0 ) // ... nor a descendant of the container
		{

			if ( jQuery(e.target).closest('.dslca-module-edit-option').hasClass('dslca-option-off') ) {

				var control_id = $(e.target).closest('.dslca-module-edit-option').find('.dslca-module-edit-field').data('id');
				dslc_toogle_control (control_id);
			}
		}
	});

/* Reset all styling – not ready

	$(document).on( 'click', '.dslca-clear-styling-button', function(e){
		e.preventDefault();


		$('.dslca-option-with-toggle').each(function(e){
			// var control_id = $(this).find('.dslca-module-edit-field').data('id');
			$(this).find('.dslca-module-edit-field').val('').trigger('change');
		});

		dslc_module_output_altered(); // call module regeneration

	});
*/
});

// Very Slow do not use for live editing
// Only use when you need to disable some of the CSS properties.

function disable_css_rule(selectorCSS, ruleCSS, moduleID) {

	var cssRules;
	var target_stylsheet_ID = 'css-for-' + moduleID;
	var stylesheet = document.getElementById('page-builder-frame').contentWindow.document.getElementById(target_stylsheet_ID);

	selectorCSS = selectorCSS.replace( /\s\s+/g, ' ' );

	if (stylesheet) {

		stylesheet = stylesheet.sheet;

		if (stylesheet['rules']) {

			cssRules = 'rules';
		} else if (stylesheet['cssRules']) {

			cssRules = 'cssRules';
		} else {

			//no rules found... browser unknown
		}

		// Go through each CSS rule (ex.: .content h1 {...})
		for (var R = 0; R < stylesheet[cssRules].length; R++) {

			// Is current CSS rule equal to the selectorCSS we are looking for?
			// (ex.: '.content h1' == '.content h1' )
			if (stylesheet[cssRules][R].selectorText == selectorCSS) {

				// Get CSS property we are looking for... (ex.: font-size : ...; )
				if(stylesheet[cssRules][R].style[ruleCSS]){

						stylesheet[cssRules][R].style[ruleCSS] = '';
					break;
				}
			}
		}
	}
}

function dslc_combine_value_and_extension ( value, extension) {

	if ( '' === value || null === value ) {

		return value;
	}

	// Check if value do not already include extension
	if ( value.indexOf(extension) == -1 ) {

		value = value + extension;
	}

	return value;
}

function dslc_get_control_value ( control_id ) {

	var control      = jQuery('.dslca-module-edit-option-' + control_id );
	var control_type = 'text';
	var control_storage = control.find('.dslca-module-edit-field');
	var value;

/*
	if ( control.hasClass('dslca-module-edit-option-select') ) {

	} else {
		// text based controls
		value = control_storage.val();
	}
*/
	value = control_storage.val();

	return value;
}

/**
 * Bind keypress events with both parent and iframe pages.
 * Function called when content inside iframe is loaded.
 *
 * @return {void}
 */
function dslc_keypress_events() {

	jQuery( [document, document ] ).unbind('keydown').bind('keydown', function (keydown_event) {

		// Modal window [ESC]/[Enter]
		dslc_modal_keypress_events(keydown_event);

		// Prevent backspace from navigating back
		dslc_disable_backspace_navigation(keydown_event);

		// Prompt Modal on F5
		dslc_notice_on_refresh(keydown_event);

	});
}

/**
 * Action - Prevent backspace from navigating back
 */

function dslc_disable_backspace_navigation (event) {

	var doPrevent = false;

	if (event.keyCode === 8) {

		var d = event.srcElement || event.target;

		if ( (d.tagName.toUpperCase() === 'INPUT' && (
				d.type.toUpperCase() === 'TEXT' ||
				d.type.toUpperCase() === 'PASSWORD' ||
				d.type.toUpperCase() === 'NUMBER' ||
				d.type.toUpperCase() === 'SEARCH' ||
				d.type.toUpperCase() === 'FILE')
			  )
			 || d.tagName.toUpperCase() === 'TEXTAREA'
			 || jQuery(d).hasClass('dslca-editable-content')
			 || jQuery(d).hasClass('dslc-tabs-nav-hook-title')
			 || jQuery(d).hasClass('dslc-accordion-title') ) {

			doPrevent = d.readOnly || d.disabled;
		} else {

			doPrevent = true;
		}
	}

	if (doPrevent) {
		event.preventDefault();
	}
}

/**
 * Actions - Prompt Modal on F5
 *
 * 116 – F5
 * 81 + event.metaKey = CMD + R
 */

function dslc_notice_on_refresh(e) {

	if ( e.which == 116 || ( e.which === 82 && e.metaKey ) ) {

		if ( jQuery('.dslca-save-composer-hook').offsetParent !== null || jQuery('.dslca-module-edit-save').offsetParent !== null ) {

			e.preventDefault();
			LiveComposer.Builder.UI.CModalWindow({

				title: DSLCString.str_refresh_title,
				content: DSLCString.str_refresh_descr,
				confirm: function() {

					window.location.reload();
				}
			});

			/*dslc_js_confirm( 'disable_lc', '<span class="dslca-prompt-modal-title">' + DSLCString.str_refresh_title +
			 '</span><span class="dslca-prompt-modal-descr">' + DSLCString.str_refresh_descr + '</span>', document.URL );*/
		}
	}
}

/**
 * Generate report about JS error and save it in a local storage.
 * @param  String error Error text
 * @param  String file  File with error
 * @param  String line  Line with error
 * @param  String char  Column with error
 * @return void
 */
function dslca_generate_error_report ( error, file, line, char ) {

	var title = 'JavaScript error detected in a third-party plugin';

	if ( file.match("wp-content\/plugins\/live-composer-page-builder\/js") != null ) {

		title = 'Live Composer returned JS error';
	}

	var error_report = '';
	error_report += '<br /><strong style="color:#E55F5F;">' + title + '</strong><br />';
	error_report += error + '<br /> File "' + file + '", line ' + line + ', char ' + char + '<br />';

	if ( 'undefined' !== typeof(Storage)) {
		localStorage.setItem('js_errors_report', error_report);
	}
}

/**
 * Put in a hidden div#dslca-js-errors-report information from local storage
 * @return void
 */
function dslca_update_report_log() {

	var errors_container = document.getElementById('dslca-js-errors-report');
	var error_report = localStorage.getItem('js_errors_report');

	if ( null !== error_report ) {
		errors_container.value = error_report;
		localStorage.removeItem('js_errors_report');
		document.querySelector( '.dslca-show-js-error-hook' ).setAttribute('style','visibility:visible');
	}
}
