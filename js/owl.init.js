/**
 * Leyoxa – owl.init.js
 * Initialises Owl Carousel for the testimonials section.
 */
(function ($) {
    'use strict';

    $(document).ready(function () {
        /* Testimonials carousel */
        if ($('#customer-testi').length) {
            $('#customer-testi').owlCarousel({
                loop: true,
                margin: 24,
                nav: false,
                dots: true,
                autoplay: true,
                autoplayTimeout: 5000,
                autoplayHoverPause: true,
                responsive: {
                    0:   { items: 1 },
                    576: { items: 2 },
                    992: { items: 3 }
                }
            });
        }

        /* Any other .owl-carousel on the page */
        $('.owl-carousel:not(#customer-testi)').each(function () {
            if (!$(this).hasClass('owl-loaded')) {
                $(this).owlCarousel({
                    loop: true,
                    margin: 24,
                    nav: false,
                    dots: true,
                    responsive: {
                        0:   { items: 1 },
                        576: { items: 2 },
                        992: { items: 3 }
                    }
                });
            }
        });
    });

})(jQuery);
