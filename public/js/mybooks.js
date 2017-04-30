var heightScale = 0.4;
var reqBooks = [];
for(var x = 0; x<requestedBooks.length; x++){
    reqBooks.push(requestedBooks[x].book);
}
console.log(reqBooks);
function addListner(){
    $(".del-book").off('click');
    $(".del-book").click(function(){
        var ele = $(this).parent();
        var book = $(this).attr('for-book');
        $.ajax({
            type: 'POST',
            url: '/delBook',
            data:{
                book: book
            }, 
            success: function(){
                ele.hide('fast', function(){
                    ele.remove();
                });
                $("[for-book='"+book+"']").hide('fast', function(){
                    $("[for-book='"+book+"']").remove();
                });
                console.log("Array: "+reqBooks+" book: "+book+" index: "+reqBooks.indexOf(book));
                if(reqBooks.indexOf(book)!==-1){
                    var pastReqs = $("#received").attr('amount');
                    var newReqs = pastReqs - 1; 
                    $("#received").attr('amount', newReqs);
                    $("#received").text("Incoming Trade Requests ("+newReqs+" incoming)");
                    reqBooks = reqBooks.filter(function(name){
                        return name!==book;
                    });
                }
            },
            error: function(){
                alert("ERROR");
            }
        });
    });
}
$(document).ready(function(){
    addListner();
    $(".my-book").attr('style', 'height:'+$(window).height()*heightScale+"px;");
    $("#add-book").click(function(){
        var bookName = $("#book-text").val();
        $.ajax({
            type: "POST",
            url: "/mybooks",
            data:{
                bookName: bookName
            },
            success: function(data){
                var image = data;
                var element = "<div class='book-div' for-book="+bookName+">\
                                    <img src='"+image+"' class='my-book'></img>\
                                    <button class='del-book' for-book="+bookName+"><span class='fa fa-times'></span></button>\
                                </div>";
                $("#my-books").append(element);
                $(".my-book").attr('style', 'height:'+$(window).height()*heightScale+"px;");
                addListner();
            },
            error: function(){
                
            }
        });
    });
})