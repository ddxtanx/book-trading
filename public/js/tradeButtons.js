function decrementAmount(){
    var am = $("#received").attr('amount')-1;
    $("#received").attr('amount', am);
    $("#received").text("Incoming Trade Requests ("+am+" incoming)");
}
$(document).ready(function(){
    $("#recTrades").hide();
    $("#reqTrades").hide();
    var recShowing = true;
    var reqShowing = true;
    $("#received").click(function(){
        if(recShowing){
            $("#recTrades").show('fast');
            recShowing = false;
        }else{
            $("#recTrades").hide('fast');
            recShowing = true;
        }
    });
    $("#requested").click(function(){
        if(reqShowing){
            $("#reqTrades").show('fast');
            reqShowing = false;
        }else{
            $("#reqTrades").hide('fast');
            reqShowing = true;
        }
    });
    $(".cancel-trade").click(function(){
        var ele = $(this).parent();
        var book = $(this).attr('for-book');
        $.ajax({
            type: "POST",
            url: "/cancel",
            data:{
                book: book
            },
            success: function(){
                console.log("success!");
                ele.hide('fast', function(){
                    ele.remove();
                });
                var pastReqs = $("#requested").attr('amount');
                var newReqs = pastReqs - 1; 
                $("#requested").attr('amount', newReqs);
                $("#requested").text("Your Trade Requests ("+newReqs+" outstanding)");
            }
        });
    });
    $(".accept-trade").click(function(){
        var ele = $(this).parent();
        var book = $(this).attr('for-book');
        var from = $(this).attr('for-user');
        $.ajax({
            type: 'POST',
            url: '/trades',
            data:{
                book: book,
                from: from,
                action: 'accept'
            },
            success: function(){
                ele.hide('fast', function(){
                    ele.remove();
                });
                decrementAmount();
            }
        });
    });
    $(".deny-trade").click(function(){
        var ele = $(this).parent();
        var book = $(this).attr('for-book');
        var from = $(this).attr('for-user');
        $.ajax({
            type: 'POST',
            url: '/trades',
            data:{
                book: book,
                from: from,
                action: 'deny'
            },
            success: function(){
                ele.hide('fast', function(){
                    ele.remove();
                });
                decrementAmount();
            }
        });
    });
})