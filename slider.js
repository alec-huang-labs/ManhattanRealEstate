
let sliderMonths = d3.range(0,12).map(x => new Date(2019, 11 + x, 1));
let monthInput = sliderMonths[0].toLocaleString('default', { month: 'short' });
console.log(monthInput)
$(document).ready(function(){
    $( function() {
        $( "#slider" ).slider({
            value: 0,
            min: 0,
            max: sliderMonths.length-1,
        });
        //display the current month
        $("#month").val("Slide Me!").css({"font-size": "1.5rem",
                                            "top": "1rem"})
    });
});