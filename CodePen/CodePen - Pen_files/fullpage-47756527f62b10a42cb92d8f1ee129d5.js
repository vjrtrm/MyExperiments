$("#footer-right").on("submit",function(e){e.preventDefault();var t="http://www.browserstack.com/start#";t+="start=true",t+="&resolution=1024x768&",t+=$("#open-in-choices").find(":selected").val(),t+="&url="+$("#bs-url").val(),window.location=t}),setTimeout(function(){$("#codepen-footer").animate({bottom:0},600)},100);