<?php

/**
 * Table of contents
 *
 * - dslc_hf_init ( Register custom post type and add options )
 * - dslc_hf_col_title ( Listing - Column title )
 * - dslc_hf_col_content ( Listing - Column content )
 * - dslc_hf_unique_default ( Make sure there's only one default per header and footer )
 * - dslc_hf_options ( Register options for posts/pages to choose which header/footer to use )
 * - dslc_hf_get_ID ( Get the header and footer ID of a specific post/page )
 * - dslc_hf_get_code ( Get the header or footer LC code of a specific post/page )
 * - dslc_hf_get_header ( Get the header output code )
 * - dslc_hf_get_footer ( Get the footer output code )
 */

// Prevent direct access to the file.
if ( ! defined( 'ABSPATH' ) ) {
	header( 'HTTP/1.0 403 Forbidden' );
	exit;
}

/**
 * Register custom post type and add options
 *
 * @since 1.0
 */

function dslc_hf_init() {
	// Takes 0.02 sec. during a page loading process.
	if ( ! defined( 'DS_LIVE_COMPOSER_HF' ) || ! DS_LIVE_COMPOSER_HF ) {
		return;
	}

	$capability = 'publish_posts';

	register_post_type( 'dslc_hf', array(
		'menu_icon' => 'dashicons-image-flip-vertical',
		'labels' => array(
			'name'				=> __( 'Headers & Footers', 'live-composer-page-builder' ),
			'menu_name' 		=> __( 'Headers/Footers', 'live-composer-page-builder' ),
			'singular_name' 	=> __( 'Add Header/Footer', 'live-composer-page-builder' ),
			'add_new' 			=> __( 'Add Header/Footer', 'live-composer-page-builder' ),
			'add_new_item' 	=> __( 'Add Header/Footer', 'live-composer-page-builder' ),
			'edit' 				=> __( 'Edit', 'live-composer-page-builder' ),
			'edit_item' 		=> __( 'Edit Header/Footer', 'live-composer-page-builder' ),
			'new_item' 			=> __( 'New Header/Footer', 'live-composer-page-builder' ),
			'view' 				=> __( 'View Header/Footer', 'live-composer-page-builder' ),
			'view_item' 		=> __( 'View Header/Footer', 'live-composer-page-builder' ),
			'search_items' 	=> __( 'Search Header/Footer', 'live-composer-page-builder' ),
			'not_found' 		=> __( 'No Header/Footer found', 'live-composer-page-builder' ),
			'not_found_in_trash' => __( 'No Header/Footer found in Trash', 'live-composer-page-builder' ),
			'parent' 			=> __( 'Parent Header/Footer', 'live-composer-page-builder' ),
		),
		'public' => true,
		'exclude_from_search' => true,
		'publicly_queryable' => true,
		'supports' => array( 'title', 'custom-fields', 'author', 'thumbnail' ),
		'capabilities' => array(
			'publish_posts' => $capability,
			'edit_posts' => $capability,
			'edit_others_posts' => $capability,
			'delete_posts' => $capability,
			'delete_others_posts' => $capability,
			'read_private_posts' => $capability,
			'edit_post' => $capability,
			'delete_post' => $capability,
			'read_post' => $capability,
		),
		'show_in_menu' => 'themes.php',
	) );

	/**
	 * Options
	 */

	global $dslc_var_post_options;
	$dslc_var_post_options['dslc-hf-opts'] = array(
		'title' => 'Options',
		'show_on' => 'dslc_hf',
		'options' => array(
			array(
				'label' => __( 'For', 'live-composer-page-builder' ),
				'descr' => __( 'Choose what is this for, header or footer.', 'live-composer-page-builder' ),
				'std' => 'header',
				'id' => 'dslc_hf_for',
				'type' => 'select',
				'choices' => array(
					array(
						'label' => 'Header',
						'value' => 'header',
					),
					array(
						'label' => 'Footer',
						'value' => 'footer',
					),
				),
			),
			array(
				'label' => __( 'Type', 'live-composer-page-builder' ),
				'std' => 'regular',
				'descr' => __( '<strong>Default</strong> will be used as the default for all the posts and pages. <strong>Regular</strong> is an additional type that you can set to specific posts/pages.', 'live-composer-page-builder' ),
				'id' => 'dslc_hf_type',
				'type' => 'radio',
				'choices' => array(
					array(
						'label' => 'Regular',
						'value' => 'regular',
					),
					array(
						'label' => 'Default',
						'value' => 'default',
					),
				),
			),
			array(
				'label' => __( 'Position', 'live-composer-page-builder' ),
				'std' => 'relative',
				'descr' => __( '<strong>Relative</strong> is normal positioning. <strong>Fixed</strong> will make the header/footer scroll with the page. <strong>Absolute</strong> will make the regular page content go behind the header/footer.', 'live-composer-page-builder' ),
				'id' => 'dslc_hf_position',
				'type' => 'radio',
				'choices' => array(
					array(
						'label' => 'Relative',
						'value' => 'relative',
					),
					array(
						'label' => 'Fixed',
						'value' => 'fixed',
					),
					array(
						'label' => 'Absolute',
						'value' => 'absolute',
					),
				),
			),
		),
	);

} add_action( 'init', 'dslc_hf_init' );

/**
 * Listing - Column Title
 *
 * @since 1.0
 */

function dslc_hf_col_title( $defaults ) {

	if ( ! defined( 'DS_LIVE_COMPOSER_HF' ) || ! DS_LIVE_COMPOSER_HF ) {
		return;
	}

	unset( $defaults['date'] );
	unset( $defaults['author'] );
	$defaults['dslc_hf_col_cpt'] = 'For';
	$defaults['dslc_hf_col_default'] = 'Type';
	return $defaults;

} add_filter( 'manage_dslc_hf_posts_columns', 'dslc_hf_col_title', 5 );

/**
 * Listing - Column Content
 *
 * @since 1.0
 */

function dslc_hf_col_content( $column_name, $post_id ) {

	if ( ! defined( 'DS_LIVE_COMPOSER_HF' ) || ! DS_LIVE_COMPOSER_HF ) {
		return;
	}

	if ( 'dslc_hf_col_cpt' === $column_name ) {
		echo get_post_meta( $post_id, 'dslc_hf_for', true );
	}

	if ( 'dslc_hf_col_default' === $column_name ) {
		if ( 'default' === get_post_meta( $post_id, 'dslc_hf_type', true ) ) {
					echo '<strong>Default</strong>';
		}
	}

} add_action( 'manage_dslc_hf_posts_custom_column', 'dslc_hf_col_content', 10, 2 );

/**
 * Make sure there's only one default per header and footer
 *
 * @since 1.0
 */

function dslc_hf_unique_default( $post_id ) {

	if ( ! defined( 'DS_LIVE_COMPOSER_HF' ) || ! DS_LIVE_COMPOSER_HF ) {
		return;
	}

	// If no post type ( not really a save action ) stop execution.
	if ( ! isset( $_POST['post_type'] ) ) {
		return;
	}

	// If not a header/footer stop execution.
	if ( 'dslc_hf' !== $_POST['post_type'] ) {
		return;
	}

	// If template type not supplied stop execution
	if ( ! isset( $_REQUEST['dslc_hf_type'] ) ) {
		return;
	}

	// If template not default stop execution
	if ( 'default' !== $_REQUEST['dslc_hf_type'] ) {
		return;
	}

	// Get header/footer that are default
	$args = array(
		'post_type' => 'dslc_hf',
		'post_status' => 'any',
		'posts_per_page' => -1,
		'meta_query' => array(
			array(
				'key' => 'dslc_hf_for',
				'value' => $_POST['dslc_hf_for'],
				'compare' => '=',
			),
			array(
				'key' => 'dslc_hf_type',
				'value' => 'default',
				'compare' => '=',
			),
		),
	);
	$templates = get_posts( $args );

	// Set those old defaults to regular tempaltes
	if ( $templates ) {
		foreach ( $templates as $template ) {
			update_post_meta( $template->ID, 'dslc_hf_type', 'regular' );
		}
	}

	// Reset query.
	wp_reset_query();

} add_action( 'save_post', 'dslc_hf_unique_default' );

/**
 * Register options for posts/pages to choose which header/footer to use
 *
 * @since 1.0
 */

function dslc_hf_options() {
	// Takes 0.02 sec during a page loading.
	$dslc_admin_interface_on = apply_filters( 'dslc_admin_interface_on', true );

	if ( ! defined( 'DS_LIVE_COMPOSER_HF' ) || ! DS_LIVE_COMPOSER_HF || true !== $dslc_admin_interface_on ) {
		return;
	}

	$headers_array = array();
	$headers_array[] = array(
		'label' => 'Default',
		'value' => 'default',
	);
	$headers_array[] = array(
		'label' => 'Disabled',
		'value' => '_disabled_',
	);
	$footers_array = array();
	$footers_array[] = array(
		'label' => 'Default',
		'value' => 'default',
	);
	$footers_array[] = array(
		'label' => 'Disabled',
		'value' => '_disabled_',
	);

	global $dslc_var_post_options;

	// Get header/footer.
	$args = array(
		'post_type' => 'dslc_hf',
		'post_status' => 'publish',
		'posts_per_page' => -1,
		'order' => 'DESC',
	);
	$templates = get_posts( $args );

	if ( $templates ) {

		foreach ( $templates as $template ) {
			$template_for = get_post_meta( $template->ID, 'dslc_hf_for', true );
			if ( 'header' === $template_for ) {
				$headers_array[] = array(
					'label' => $template->post_title,
					'value' => $template->ID,
				);
			} elseif ( 'footer' === $template_for ) {
				$footers_array[] = array(
					'label' => $template->post_title,
					'value' => $template->ID,
				);
			}
		}

		$dslc_var_post_options['dslc-hf-options'] = array(
			'title' => __( 'Header/Footer', 'live-composer-page-builder' ),
			'show_on' => array( 'page', 'dslc_templates' ),
			'context' => 'side',
			'options' => array(
				array(
					'label' => __( 'Header', 'live-composer-page-builder' ),
					'std' => '',
					'id' => 'dslc_header',
					'type' => 'select',
					'choices' => $headers_array,
				),
				array(
					'label' => __( 'Footer', 'live-composer-page-builder' ),
					'std' => '',
					'id' => 'dslc_footer',
					'type' => 'select',
					'choices' => $footers_array,
				),
			),
		);
	} // End if().

} add_action( 'init', 'dslc_hf_options' );

/**
 * Get the header and footer IDs of a specific post/page
 *
 * @since 1.0
 *
 * @param int     $post_id ID of the post/page. Default false ( Automatically finds ID ).
 * @return array  The IDs of the header and footer associated with the post/page. False if none.
 */
function dslc_hf_get_ID( $post_id = false ) {
	// Called 4 times. 0.166 sec. No profit from caching achieved.

	// If theme does not define header/footer compatibility return false.
	// If current page is actually header/footer post, return false.
	if ( ! defined( 'DS_LIVE_COMPOSER_HF' ) || ! DS_LIVE_COMPOSER_HF || is_singular( 'dslc_hf' ) ) {
		return array(
				'header' => false,
				'footer' => false,
			);
	}

	// Global vars.
	global $dslc_post_types;

	// If post ID not supplied, figure it out
	if ( ! $post_id ) {
		if ( is_singular( $dslc_post_types ) ) {
			// If currently showing a singular post of a post type
			// that supports "post templates".
			$post_id = dslc_st_get_template_id( get_the_ID() );
		} elseif ( is_archive() && ! is_author() && ! is_search() ) {
			// If currently showing a category archive page.
			$post_id = dslc_get_option( get_post_type(), 'dslc_plugin_options_archives' );
		} elseif ( is_author() ) {
			// If currently showing an author archive page.
			$post_id = dslc_get_option( 'author', 'dslc_plugin_options_archives' );
		} elseif ( is_search() ) {
			// If currently showing a search results page.
			$post_id = dslc_get_option( 'search_results', 'dslc_plugin_options_archives' );
		} elseif ( is_404() ) {
			// If currently showing 404 page.
			$post_id = dslc_get_option( '404_page', 'dslc_plugin_options_archives' );
		} else {
			// Otherwise just get the ID.
			$post_id = get_the_ID();
		}
	}

	if ( $post_id ) {
		// Get header/footer template
		$header_tpl = get_post_meta( $post_id, 'dslc_header', true );
		$footer_tpl = get_post_meta( $post_id, 'dslc_footer', true );
	} else {
		$header_tpl = false;
		$footer_tpl = false;
	}

	// If no header template set, make it "default"
	if ( ! $header_tpl ) {
		$header_tpl = 'default';
	}

	// If no footer template set make it "default"
	if ( ! $footer_tpl ) {
		$footer_tpl = 'default';
	}

	// Default header template supplied, find it and return the ID
	if ( 'default' === $header_tpl ) {

		// Query for default template
		$args = array(
			'post_type' => 'dslc_hf',
			'post_status' => 'publish',
			'posts_per_page' => 1,
			'meta_query' => array(
				array(
					'key' => 'dslc_hf_for',
					'value' => 'header',
					'compare' => '=',
				),
				array(
					'key' => 'dslc_hf_type',
					'value' => 'default',
					'compare' => '=',
				),
			),
			'order' => 'DESC',
		);
		$tpls = get_posts( $args );

		// If default template found set the ID if not make it false
		if ( $tpls ) {
			$header_tpl_id = $tpls[0]->ID;
		} else {
			$header_tpl_id = false;
		}
	} elseif ( $header_tpl && '_disabled_' !== $header_tpl ) {
		// Specific template supplied, return the ID.
		$header_tpl_id = $header_tpl;

	} elseif ( $header_tpl && '_disabled_' === $header_tpl ) {

		$header_tpl_id = false;

	} // End if().

	// Default footer template supplied, find it and return the ID.
	if ( 'default' === $footer_tpl ) {

		// Query for default template.
		$args = array(
			'post_type' => 'dslc_hf',
			'post_status' => 'publish',
			'posts_per_page' => 1,
			'meta_query' => array(
				array(
					'key' => 'dslc_hf_for',
					'value' => 'footer',
					'compare' => '=',
				),
				array(
					'key' => 'dslc_hf_type',
					'value' => 'default',
					'compare' => '=',
				),
			),
			'order' => 'DESC',
		);
		$tpls = get_posts( $args );

		// If default template found set the ID if not make it false.
		if ( $tpls ) {
			$footer_tpl_id = $tpls[0]->ID;
		} else {
			$footer_tpl_id = false;
		}
	} elseif ( $footer_tpl && '_disabled_' !== $footer_tpl ) {
		// Specific template supplied, return the ID.
		$footer_tpl_id = $footer_tpl;

	} elseif ( $footer_tpl && '_disabled_' === $footer_tpl ) {

		$footer_tpl_id = false;
	} // End if().


	$result = array(
			'header' => $header_tpl_id,
			'footer' => $footer_tpl_id,
		);

	// Return the template ID.
	return $result;
}

/**
 * Get the header or footer LC code of a specific post/page
 *
 * @since 1.0.2
 *
 * @param int     $post_id ID of the post/page. Default false.
 * @param string  $h_or_f Accepted values 'header' and 'footer'. Defaults to 'header'
 * @return string The LC code for the header/footer of the post/page. Empty string if no LC code.
 */
function dslc_hf_get_code( $post_id = false, $h_or_f = 'header' ) {

	// If support for header/footer functionality not set or is set to false, return empty string
	if ( ! defined( 'DS_LIVE_COMPOSER_HF' ) || ! DS_LIVE_COMPOSER_HF ) {
		return '';
	}

	// This will be returned at the end
	$code = '';

	// If post ID not supplied ask WordPress
	if ( ! $post_id ) {
		$post_id = get_the_ID();
	}

	// If still no ID return empty string
	if ( ! $post_id ) {
		return '';
	}

	// Get ID of the header/footer powering the post
	$header_footer = dslc_hf_get_ID( $post_id );

	// If post has header/footer attached
	if ( $header_footer[ $h_or_f ] ) {
		// Get LC code of the header/footer powering the post
		$code = get_post_meta( $header_footer[ $h_or_f ], 'dslc_code', true );
	}

	// Pass it back
	return $code;
}


function dslc_hf_get_headerfooter( $post_id = false, $hf_type = 'header' ) {

	// Compilation time 3.375 sec. before caching / 0.03 sec after caching.

	// Get header/footer ID associated with the post.
	$header_footer = dslc_hf_get_ID( $post_id );
	$hf_id = false;

	// Var defaults.
	$append = '';
	$wrapper_start = '';

	if ( $header_footer[ $hf_type ] && is_numeric( $header_footer[ $hf_type ] ) ) {
		$hf_id = $header_footer[ $hf_type ];
	}

	$position = get_post_meta( $hf_id, 'dslc_hf_position', true );

	// If the "position" option value exists
	if ( ! $position ) {
		// Set the "position" option value to default "relative"
		$position = 'relative';
	}

	// Code to insert before.
	$code_before = apply_filters( 'dslc_' . $hf_type . '_before', '' );

	// Code to insert after.
	$code_after = apply_filters( 'dslc_' . $hf_type . '_after', '' );

	// If editor active? Add a link to the header editing.
	if ( dslc_is_editor_active( 'access' ) ) {

		$header_link = DSLC_EditorInterface::get_editor_link_url( $hf_id );

		// Set the HTML for the edit overlay.
		$append = '<div class="dslc-hf-block-overlay"><a target="_blank" href="' . $header_link . '" class="dslc-hf-block-overlay-button dslca-link">' . __( 'Edit Header','live-composer-page-builder' ) . '</a>';

		if ( 'fixed' === $position ) {
			$append .= ' <span class="dslc-hf-block-overlay-text">' . __( 'To preview FIXED positioning click on "Hide Editor" button.','live-composer-page-builder' ) . '</span>';
		} elseif ( 'absolute' === $position ) {
			$append .= ' <span class="dslc-hf-block-overlay-text">' . __( 'To preview ABSOLUTE positioning click on "Hide Editor" button.','live-composer-page-builder' ) . '</span>';
		}

		$append .= '</div>';
	}

	// Initiate simple html rendering cache.
	$cache = new DSLC_Cache( 'html' );
	$cache_id = $hf_id;

	// Check if we have html for this code cached?
	if ( ! dslc_is_editor_active() || dslc_is_editor_active() && 'dslc_hf' !== get_post_type( $post_id ) ) {
		if ( $cache->enabled() && $cache->cached( $cache_id ) ) {
			// Check if any dynamic content included before caching.
			$cached_html = $cache->get_cache( $cache_id );

			// Insert header/footer editing overlay code before the last </div>
			$cached_html = substr_replace( $cached_html, $append, strrpos( $cached_html, '</div>' ), 0 );

			// $cached_html .= $append;
			return do_shortcode( $cached_html );
		}
	}

	// Wrap if handled by theme.
	if ( defined( 'DS_LIVE_COMPOSER_HF_AUTO' ) && ! DS_LIVE_COMPOSER_HF_AUTO ) {
		$wrapper_start = '<div id="dslc-content" class="dslc-content dslc-clearfix">';
	}

	// If the page displayed is header/footer, do not repeat.
	if ( is_singular( 'dslc_hf' ) ) {
		return $wrapper_start;
	}

	// If there is a header/footer applied.
	if ( $hf_id ) {

		// Render content. Support both old and new version of the page code.
		$rendered_code = dslc_render_content( get_post_meta( $hf_id, 'dslc_code', true ) );
		$rendered_code = $code_before . $wrapper_start . '<div id="dslc-' . $hf_type . '" class="dslc-' . $hf_type . '-pos-' . $position . '">' . $rendered_code . $append . '</div>' . $code_after;

		$rendered_code = dslc_decode_shortcodes( $rendered_code );

		if ( ! dslc_is_editor_active() ) { // && ! is_singular( 'dslc_hf' )
			$cache->set_cache( $rendered_code, $cache_id );
		}
		// Add the code to the variable holder.
		return do_shortcode( $rendered_code );

	} else {

		// If no header/footer applied.
		return $code_before . $wrapper_start . '' . $code_after;
	} // End if().
}

/**
 * Get the header output code
 *
 * @since 1.0.2
 *
 * @param int     $post_id ID of the post/page. Default false.
 * @return string The HTML ouput of the header for a defined post/page
 */
function dslc_hf_get_header( $post_id = false ) {
	// Compilation time 3.375 sec. before caching / 0.03 sec after caching.
	return dslc_hf_get_headerfooter( $post_id, 'header' );
}

/**
 * Get the footer output code
 *
 * @since 1.0.2
 *
 * @param int     $post_id ID of the post/page. Default false.
 * @return string The HTML ouput of the footer for a defined post/page
 */
function dslc_hf_get_footer( $post_id = false ) {
	// Compilation time 1.16 sec. before caching / 0.04 sec after caching.
	return dslc_hf_get_headerfooter( $post_id, 'footer' );
}
