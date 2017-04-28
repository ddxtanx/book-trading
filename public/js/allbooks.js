var heightScale = 0.4;
$(document).ready(function(){
    $(".book").attr('style', 'height:'+$(window).height()*heightScale+"px;");
    $(".trade-book").click(function(){
        var ele = $(this);
        var book = ele.attr('for-book');
        var forUser = ele.attr('for-user');
        $.ajax({
            type:"POST",
            url:"/trade",
            data: {
                book: book,
                forUser: forUser
            },
            success:function(){
                ele.hide('fast', function(){
                    ele.remove();
                });
                var element = "<div class='trade requested'>\
                                <h3>"+book+"</h3>\
                                <button class='cancel-trade' for-book="+book+" ><span class='fa fa-times'></span></button>\
                            </div>";
                $("#reqTrades").append(element);
                $("#requested").attr('amount', parseInt($("#requested").attr('amount'))+1);
                $("#requested").text("Your Trade Requests ("+$("#requested").attr("amount")+" outstanding)");
            }
        });
    });
})