
//start search
$(document).ready(function() {


    $("#search").focusin(function() {
        $(".search-result").removeClass("hidden");
        $(".search-box").addClass("search-box-active");
    }).add(".search-result").focusout(function() {
        if ( !$(".search-result").is(':focus') ) {
            $(".search-result").addClass("hidden");
            $(".search-box").removeClass("search-box-active");
        }
    });


});
//end search



//start super navbar
$(document).ready(function(){

    $(".super-navbar-item").hover(function () {
        $(".sublist-item").removeClass("sublist-item-active");
        $(".sublist-item").first().addClass("sublist-item-active");
    }, function () {
        $(".sublist-item").removeClass("sublist-item-active");
    });

    $(".sublist-item-toggle").click(function(){
        $(".sublist-item").removeClass("sublist-item-active");
        $(this).parent().addClass("sublist-item-active");
    });

    $(".sublist-item-toggle").hover(function(){
        $(".sublist-item").removeClass("sublist-item-active");
        $(this).parent().addClass("sublist-item-active");
    });

});
//end super navbar



//start owlcarousel
$(document).ready(function(){
    $("#slideshow").owlCarousel({
        rtl:true,
        loop:true,
        margin:0,
        nav:false,
        autoplay:true,
        autoplayTimeout:5000,
        autoplayHoverPause:true,
        animateOut: 'fadeOut',
        animateIn: 'fadeIn',
        items: 1
    });

    $(".lazyload").owlCarousel({
        rtl:true,
        loop:false,
        margin:10,
        nav:true,
        dots:false,
        autoplay:false,
        autoHeight: false,
        items: 5,
        responsive : {
            // breakpoint from 0 up
            0 : {
                items: 1,
            },
            // breakpoint from 480 up
            480 : {
                items: 2,
            },
            // breakpoint from 768 up
            768 : {
                items: 5,
            }
        }
    });


    $(".brands").owlCarousel({
        rtl:true,
        loop:true,
        margin:10,
        nav:true,
        dots:false,
        autoplay:true,
        autoplayTimeout:5000,
        autoplayHoverPause:true,
        animateOut: 'fadeOut',
        animateIn: 'fadeIn',
        items: 5,
        responsive : {
            // breakpoint from 0 up
            0 : {
                items: 1,
            },
            // breakpoint from 480 up
            480 : {
                items: 2,
            },
            // breakpoint from 768 up
            768 : {
                items: 5,
            }
        }
    });



    // $(".owl-carousel").owlCarousel({
    //     rtl:true,
    //     loop:true,
    //     margin:0,
    //     nav:false,
    //     autoplay:true,
    //     autoplayTimeout:5000,
    //     autoplayHoverPause:true,
    //     animateOut: 'fadeOut',
    //     animateIn: 'fadeIn',
    //     items: 1
    // });
});
//end owlcarousel






//start cart
$(document).ready(function() {

    $(".cart-number-up").click(function(){
        var value = parseInt($(this).parent().find('input[type=number]').val());
        if(value < 5) {
            $(this).parent().find('input[type=number]').val(value + 1);
        }
    });

    $(".cart-number-down").click(function(){
        var value = parseInt($(this).parent().find('input[type=number]').val());
        if(value > 1) {
            $(this).parent().find('input[type=number]').val(value - 1);
        }
    });

});
//end cart




//start address
$(document).ready(function() {

    $('input[name="address"]').change(function(){

        var address = $('input[name="address"]').is(":checked");
        var delivery_type = $('input[name="delivery_type"]').is(":checked");

        if(address == true && delivery_type == true) {
            $("#address-button").removeClass("block");
            $("#address-button").addClass("hidden");
            $("#next-level").removeClass("hidden");
            $("#next-level").addClass("block");
        }
    });

    $('input[name="delivery_type"]').change(function(){

        var address = $('input[name="address"]').is(":checked");
        var delivery_type = $('input[name="delivery_type"]').is(":checked");

        if(address == true && delivery_type == true) {
            $("#address-button").removeClass("block");
            $("#address-button").addClass("hidden");
            $("#next-level").removeClass("hidden");
            $("#next-level").addClass("block");
        }
    });


});
//end address


//start payment
$(document).ready(function() {

    $('input[name="payment_type"]').change(function(){

        var payment_type = $('input[name="payment_type"]').is(":checked");

        if(payment_type == true) {
            $("#payment-button").removeClass("block");
            $("#payment-button").addClass("hidden");
            $("#final-level").removeClass("hidden");
            $("#final-level").addClass("block");
        }
    });


});
//end payment



//start filter
$(document).ready(function() {

    $(".sidebar-nav-item-title").click(function(){
        $header = $(this);
        $content = $header.next();

        $(".sidebar-nav-sub-sub-wrapper").slideUp();
        $(".sidebar-nav-sub-item-title i").removeClass("rotate-angle-left-90-degrees");
        if($content.is(":visible")) {
            $header.find("i").removeClass("rotate-angle-left-90-degrees");
            $content.slideUp();
        } else {
            $(".sidebar-nav-item-title i").removeClass("rotate-angle-left-90-degrees");
            $(".sidebar-nav-sub-wrapper").slideUp();
            $header.find("i").addClass("rotate-angle-left-90-degrees");
            $content.slideToggle(400);
        }
    });

    $(".sidebar-nav-sub-item-title").click(function(){
        $subHeader = $(this);
        $subContent = $subHeader.next();

        if($subContent.is(":visible")) {
            $subHeader.find("i").removeClass("rotate-angle-left-90-degrees");
            $subContent.slideUp();
        } else {
            $(".sidebar-nav-sub-item-title i").removeClass("rotate-angle-left-90-degrees");
            $(".sidebar-nav-sub-sub-wrapper").slideUp();
            $subHeader.find("i").addClass("rotate-angle-left-90-degrees");
            $subContent.slideToggle(400);
        }
    });

});
//end filter


//start filter
$(document).ready(function() {

    $(".product-gallery-selected-image img").css("height", $(".product-gallery-selected-image img").css("width"));
    $(".product-gallery-thumb").click(function(){
        var selectedImageSrc = $(this).attr("data-input");
        $(".product-gallery-selected-image img").attr("src", selectedImageSrc);
        $(".product-gallery-selected-image img").css("height", $(".product-gallery-selected-image img").css("width"));
    });

});
//end filter



//start product introduction, features and comment

//end product introduction, features and comment
