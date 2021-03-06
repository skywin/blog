var weiboName = "@zouchengzhuo";
var duoshuoName = "";
var disqusName = "";

/*!
 * jQuery Cookie Plugin v1.4.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    var pluses = /\+/g;
    function encode(s) {
        return config.raw ? s : encodeURIComponent(s);
    }
    function decode(s) {
        return config.raw ? s : decodeURIComponent(s);
    }
    function stringifyCookieValue(value) {
        return encode(config.json ? JSON.stringify(value) : String(value));
    }
    function parseCookieValue(s) {
        if (s.indexOf('"') === 0) {
            // This is a quoted cookie as according to RFC2068, unescape...
            s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        }
        try {
            // Replace server-side written pluses with spaces.
            // If we can't decode the cookie, ignore it, it's unusable.
            // If we can't parse the cookie, ignore it, it's unusable.
            s = decodeURIComponent(s.replace(pluses, ' '));
            return config.json ? JSON.parse(s) : s;
        } catch(e) {}
    }
    function read(s, converter) {
        var value = config.raw ? s : parseCookieValue(s);
        return $.isFunction(converter) ? converter(value) : value;
    }
    var config = $.cookie = function (key, value, options) {
        if (value !== undefined && !$.isFunction(value)) {
            options = $.extend({}, config.defaults, options);
            if (typeof options.expires === 'number') {
                var days = options.expires, t = options.expires = new Date();
                t.setTime(+t + days * 864e+5);
            }
            return (document.cookie = [
                encode(key), '=', stringifyCookieValue(value),
                options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                options.path    ? '; path=' + options.path : '',
                options.domain  ? '; domain=' + options.domain : '',
                options.secure  ? '; secure' : ''
            ].join(''));
        }
        var result = key ? undefined : {};
        // To prevent the for loop in the first place assign an empty array
        // in case there are no cookies at all. Also prevents odd result when
        // calling $.cookie().
        var cookies = document.cookie ? document.cookie.split('; ') : [];
        for (var i = 0, l = cookies.length; i < l; i++) {
            var parts = cookies[i].split('=');
            var name = decode(parts.shift());
            var cookie = parts.join('=');
            if (key && key === name) {
                // If second argument (value) is a function it's a converter...
                result = read(cookie, value);
                break;
            }
            // Prevent storing a cookie that we couldn't decode.
            if (!key && (cookie = read(cookie)) !== undefined) {
                result[name] = cookie;
            }
        }
        return result;
    };
    config.defaults = {};
    $.removeCookie = function (key, options) {
        if ($.cookie(key) === undefined) {
            return false;
        }
        // Must not alter options, thus extending a fresh object...
        $.cookie(key, '', $.extend({}, options, { expires: -1 }));
        return !$.cookie(key);
    };
}));

var log = function(msg){
    console && console.log && console.log(msg);
};
// 模板引擎
var tplEngine = function(tpl, data) {
    var reg = /<%([^%>]+)?%>/g,
        regOut = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g,
        code = 'var r=[];\n',
        cursor = 0;

    var add = function(line, js) {
        js? (code += line.match(regOut) ? line + '\n' : 'r.push(' + line + ');\n') :
            (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
        return add;
    }
    while(match = reg.exec(tpl)) {
        add(tpl.slice(cursor, match.index))(match[1], true);
        cursor = match.index + match[0].length;
    }
    add(tpl.substr(cursor, tpl.length - cursor));
    code += 'return r.join("");';
    return new Function(code.replace(/[\r\t\n]/g, '')).apply(data);
};
// 移动设备侦测
var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    }
    ,BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    }
    ,iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    }
    ,Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    }
    ,Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    }
    ,any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

var operation = {
    init: function(){
        this.wechat();
        this.fontChange();
        this.toTop();
        this.share();
        this.footerNav();
        this.bind();
        this.tips();
        //this.insertWeibo();
    },
    wechat: function(){
        var isWeiXin = /MicroMessenger/i.test(navigator.userAgent);
        var $ctt = $(".article .post-content");
        var wechatStr = '<div class="wechat-info"><b>温馨提示：</b>您现在处在 <span class="wechat-net">WiFi</span>' +
            ' 网络下。若文章表述存在问题，可点击段落，在右侧留言，或者直接给邹成卓 <span class="wechat-email">邮件 ← 点击</span>。</div>';
        if(!$ctt.length || !isWeiXin) return;
        $.getScript("/public/js/wechat.js", function(){
            $ctt.prepend(wechatStr);
            wechat('network', function(res){
                $(".wechat-net").text(res.err_msg.split(':')[1]);
            });
            $(".wechat-email").on("click", function(){
                var data = {
                  app: '',
                  img: function() {
                    var $imgs = $(".post-content img");
                    return $imgs.length > 2 ? $imgs.eq(1).attr("src") : '';
                  },
                  link: window.location.href,
                  desc: $(".ds-share").attr("data-content").replace(/<[^>]*?>/gmi, ""),
                  title: $(".ds-share").attr("data-title")
                };
                wechat('email', data, function(){ });
            });
        });
    },
    welcome: function(){
        var self = this, visitor;

        function getNamefailed(){
            var histories = {}, userinfo = {};
            try{ histories = JSON.parse($.cookie("visitor_history")); }catch(e){}
            for(var key in histories){
                userinfo = {
                    name: key,
                    avatar: histories[key]
                }
            }
            if(userinfo.name && userinfo.avatar){
                var htmlStr = makeHtml(userinfo.name, userinfo.avatar);
                self.alertMsg(htmlStr);
            }
        }

        function makeHtml(name, avatar){
            return "<img class='alert-avatar' src='" + avatar + "'>" + name + ", 欢迎回来~";
        }

        if(visitor = $.cookie("visitor")) {
            visitor = visitor.split("|");
            if(visitor && visitor[0] && visitor[1]){
                // var htmlStr = makeHtml(visitor[0], visitor[1]);
                // self.alertMsg(htmlStr);
                return;
            }
        }

        $.removeCookie("visitor");
        duoshuoName && $.ajax({
          url: "http://" + duoshuoName +".duoshuo.com/api/threads/listPosts.jsonp?thread_key=/&require=visitor",
          dataType: "jsonp",
          timeout: 5000,
          success: function(data){
            if(!(data && data.visitor && data.visitor.name && data.visitor.avatar_url)) {
                getNamefailed();
                return;
            }
            var name = data.visitor.name;
            var avatar = data.visitor.avatar_url;
            if(/大额大额/.test(name)){
                name = "亲爱的";
            }
            var htmlStr = makeHtml(name, avatar);
            self.alertMsg(htmlStr);

            // 目前登录人缓存半天
            $.cookie("visitor", name + "|" + avatar, {
                expires: 0.25,
                path: "/"
            });

            // 缓存历史登录者
            var histories = $.cookie("visitor_history");
            try{
                histories = JSON.parse(histories);
            }catch(e){
                histories = {};
            }
            histories[name] = avatar;
            try{
                $.cookie("visitor_history", JSON.stringify(histories), {
                    expires: 100,
                    path: "/"
                });
            }catch(e){}
          },
          error: function(){
            getNamefailed();
          }
        });
    },
    insertWeibo: function(){
        var htmlStr = '<iframe width="330" height="350" class="share_self"  frameborder="0" scrolling="no" src="http://widget.weibo.com/weiboshow/index.php?language=&width=330&height=350&fansRow=1&ptype=1&speed=0&skin=1&isTitle=0&noborder=0&isWeibo=1&isFans=0&uid=5444848999&verifier=73dc4ca5&dpc=1"></iframe>';
        if(/\/entry\//.test(window.location.href) && !isMobile.any()
            && ($(window).width() > 992) && !$(".share_self").size()){
            $(window).on("load", function(){
                $(".rightbar-frame").css("background", "none").append(htmlStr);
            });
        }
        if(isMobile.any()) {
            $(".rightbar-frame").remove()
        }
    },
    alertMsg: function(msg){
        if(!msg) return;
        var $msg = $(".alertInfo").size() ? $(".alertInfo") : $("<div class='alertInfo'></div>").appendTo($("body"));
        $msg = $($msg);
        $msg.html(msg).css("right", "-9999").animate({
            right: 20
        }, 800);
        clearTimeout(window._alert_timer);
        window._alert_timer = setTimeout(function(){
            $msg.animate({right: -9999}, 800);
        }, 3000);
    },
    tips: function(){
        var htmlStr = [
            '<div class="arrow-tips">',
            '  <h5>小建议: </h5>',
            '  <span class="close">x</span>',
            '  <ul>',
            '    <li><code>shift+alt+↑</code>: 回到顶部</li>',
            '    <li><code>shift+alt+↓</code>: 去评论</li>',
            '    <li><code>shift+alt+←</code>: 上一篇</li>',
            '    <li><code>shift+alt+→</code>: 下一篇</li>',
            '  </ul>',
            '</div>'
        ].join("\n");
        if(isMobile.any() || $.cookie("tips_readed") || $(".post-title").size() == 0) return;
        $("body").append(htmlStr);
        $(document).on("click", ".arrow-tips .close", function(){
            $.cookie("tips_readed", true, {
                expires: 8,
                path: "/"
            });
            $(".arrow-tips").remove();
        });
    },
    bind: function(){
        var self = this;
        !$(".post").size() && $(".sharecanvas").hide();
        $(window).on("load, hashchange", function(){
            var hash = window.location.hash;
            if(hash && hash === "#comments") {
                $(".hash-to-comments").trigger("click");
            }
        });
        $(".to-comments").on("click", function(evt){
            evt.preventDefault();
            $(".hash-to-comments").trigger("click");
        });
        $(".sharecanvas").on("click", function(evt){
            var $this = $(this);
            if($this.attr("process") == 1) return;
            $this.attr("process", 1);
            evt.preventDefault();
            function dataURItoBlob(dataURI) {
                // convert base64 to raw binary data held in a string
                var byteString
                  ,mimestring

                if(dataURI.split(',')[0].indexOf('base64') !== -1 ) {
                    byteString = atob(dataURI.split(',')[1])
                } else {
                    byteString = decodeURI(dataURI.split(',')[1])
                }

                mimestring = dataURI.split(',')[0].split(':')[1].split(';')[0]

                var content = new Array();
                for (var i = 0; i < byteString.length; i++) {
                    content[i] = byteString.charCodeAt(i)
                }

                return new Blob([new Uint8Array(content)], {type: mimestring});
            }
            $this.text("截图中..");
            $.getScript("/public/js/html2canvas.min.js", function(){
                $(".wechart img").clone().attr("id", "_wechartImg").css({display: "block", "margin": "0 auto"}).appendTo($('.post-content'));
                $(".this-page-link").hide();
                $(".article").addClass("screenshot");
                $("html,body").width(520);
                $(".post-content>p .icon.a-comments").hide();
                var st = $(window).scrollTop();
                $(window).scrollTop(0);
                html2canvas($('.article').css("background", "#FFF")).then(function(canvas) {
                    canvas.id="shareCanvas";
                    canvas.style.display = "none";
                    document.body.appendChild(canvas);
                    //var newImg = document.createElement("img");
                    var img = dataURItoBlob(shareCanvas.toDataURL('image/png'));
                    //var url = window.URL.createObjectURL();

                    var base = "http://tmpfile.coding.io/";
                    var fd = new FormData();
                    fd.append("img", img);
                    $this.text("分享中..");

                    var local = location.href,
                    title = $(".post-title").text() && ("文章《" + weiboName + " " +  $(".post-title").text() + "》");
                    if(!title) title += "好站分享 " + weiboName + " ";
                    title += $("meta[property='og:description']").attr("content").slice(0, 95);
                    var shareUrl = "http://service.weibo.com/share/share.php?appkey=5444848999&title=" +
                    title + "&url=" + local + "&searchPic=false&style=simple";
                    $.ajax({
                        type: "POST",
                        url: base + "img",
                        dataType: 'json',
                        data: fd,
                        crossDomain: true,
                        processData: false,
                        contentType: false,
                        success: function(data){
                            if(data && data.path) {
                                shareUrl += "&pic=" + encodeURIComponent(base + "tmp/" + data.path);
                                operation._shareWin(shareUrl);
                                $("#shareCanvas").remove();
                                $this.text("分享成功");
                                setTimeout(function(){
                                    $this.removeAttr("process");
                                    $this.text("微博分享");
                                    $this.parent(".func-item").trigger("mouseleave");
                                }, 500);
                            }
                        },
                        error: function(){
                            $this.text("截图失败");
                            operation._shareWin(shareUrl);
                            setTimeout(function(){
                                $this.removeAttr("process");
                                $this.text("微博分享");
                                $this.parent(".func-item").trigger("mouseleave");
                            }, 500);
                        }
                    });
                });
                $(".post-content>p .icon.a-comments").show();
                $("html,body").css("width", "");
                $(window).scrollTop(st);
                $('#_wechartImg').remove();
                $(".article").css("background", "");
                $(".this-page-link").show();
                $(".article").removeClass("screenshot");
            });
        });
        $(".hash-to-comments").on("click", function(evt){
            evt.preventDefault();
            var $target = $(".footer-nav a").eq(0);
            !$target.attr("id") && $target.trigger("click");
            if(/#footer-nav-on/.test(window.location.href)) {
                window.location.href = window.location.href;
            } else {
                window.location.hash = "#footer-nav-on";
            }
        });
        if($(".entry-page-search").size()) {
            var $input = $(".entry-page-search input");
            $input.on("keyup change keydown", function(evt){
                var val = $.trim($input.val());
                if(val && (evt.which == 13 || evt.type == 'change')) {
                    window.open('https://www.google.com.hk/search?q=site:www.zoucz.com ' + val);
                }
            });
            $(".entry-page-search i").on("click", function(){
                $input.trigger("change");
            });
        }
        $(window).on("resize", function(){
            //self.insertWeibo();
        });
        $(window).on("keydown", function(evt){
            if(evt.shiftKey && evt.altKey ) {
                if(evt.keyCode == 39) { // right
                    var href = $(".page-relative-fixed .next").attr("href");
                    if(href){
                        (window.location.href = href);
                    } else {
                        self.alertMsg("已经是最后一篇文章了~");
                    }
                }
                if(evt.keyCode == 37) { // left
                    var href = $(".page-relative-fixed .prev").attr("href");
                    if(href){
                        (window.location.href = href);
                    } else {
                        self.alertMsg("已经是第一篇文章了~");
                    }
                }
                if(evt.keyCode == 38) { // top
                    window.scrollTo(0, 0);
                }
                var $target = $(".footer-nav a").eq(0);
                !$target.attr("id") && $target.trigger("click");
                if(evt.keyCode == 40) { // down
                    if(/#footer-nav-on/.test(window.location.href)) {
                        window.location.href = window.location.href;
                    } else {
                        window.location.hash = "#footer-nav-on";
                    }
                }
                $.cookie("tips_readed", true, {
                    expires: 8,
                    path: "/"
                });
                // shift + alt + o
                if(evt.keyCode === 79 && /blog\/(\d+\/){3}/.test(window.location.pathname)){
                    var path = window.location.pathname.slice(6, -1).replace(/\//g, "-") + ".md";
                    var jumpUrl = "https://github.com/zouchengzhuo/blog/edit/master/blog/src/_posts/" + path;
                    window.open(jumpUrl);
                }
            }
        });
    },
    isIE: function(num){
        var name = navigator.appVersion.toUpperCase();
        return num ? name.match(/MSIE (\d)/) && name.match(/MSIE (\d)/)[1] == num
              : /MSIE (\d)/.test(name);
    },
    // 添加运行代码的 button
    addRunCodeBtn: function(){
        $(".addrunbtn").each(function() {
            var $this = $(this);
            $this.append("<span class='runCode'>运行代码</span>");
        });
        //runCode
        $(".highlight").on("click", ".runCode", function(evt) {
            evt.stopPropagation();

            var code = $(this).parents(".highlight").find("code").text();

            code = $(this).parents(".highlight").hasClass('jscode') ? ("该 blob 流源自: <a href='" + window.location.href +
                    "'>邹成卓的个人网站</a><br /><span style='color:red;font-size:12px;line-height:50px;'>"+
                    "有些数据可能在 console 中显示~</span><script>" + code + "</script>") : code;

            if (!operation.isIE()) {
                window.open(URL.createObjectURL(new Blob([code], {
                    type: "text/html; charset=UTF-8"
                })));
            } else {
                var d = window.open("about:blank").document;
                d.write(code);
                d.close();
            }
        });
    },
    // 底部tab切换
    footerNav: function(){
        $(".footer-nav a").on("click", function(evt){

            evt.preventDefault();

            var index =  $(this).index();
            $(".footer-nav a").removeAttr("id");
            $(this).attr("id", "footer-nav-on");

            $(".nav-detail>div").hide().eq(index).fadeIn();
        });
        $(".relative-to-comment").on("click", function(){
            $(".footer-nav a").eq(0).trigger("click");
        });
    },
    // 分享
    share: function(title){
        var local = location.href,
            title = $(".post-title").text() && ("文章《" + weiboName + " " +  $(".post-title").text() + "》");

        if(!title) title += "好站分享 " + weiboName + " ";

        title += $("meta[property='og:description']").attr("content").slice(0, 95);

        $("#share-weibo").off().on("click", function(){
            var url = "http://service.weibo.com/share/share.php?appkey=5444848999&title=" +
            title + "&url=" + local + "&searchPic=false&style=simple"; // &pic=a.jpg;

            operation._shareWin(url);
        });
        $("#share-tencent").off().on("click", function(){
            var url = "http://share.v.t.qq.com/index.php?c=share&a=index&url="+
            local + "&title=" + title;
            operation._shareWin(url);
        });
        // $("#share-qzone").off().on("click", function(){
        //     var url = "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url="+
        //     local + "&title=" + title;
        //     operation._shareWin(url);
        // });
        $("#share-twitter").off().on("click", function(){
            //var url = "http://twitter.com/share?url="+local+"&text="+title+"&related=barret_china"
            //operation._shareWin(url);
        });
        $("#share-douban").off().on("click", function(){
            var url = "http://www.douban.com/recommend/?url="+local+"&title="+title+"&v=1"
            operation._shareWin(url);
        });
    },
    _shareWin: function(r){
            var d = document;
            var x=function(){if(!window.open(r,'share','toolbar=0,status=0,resizable=1,scrollbars=yes,status=1,width=440,height=430,left='+(screen.width-440)/2+',top='+(screen.height-430)/2)) return;};if(/Firefox/.test(navigator.userAgent)){setTimeout(x,0)}else{x()}
    },
    // 回到顶部
    toTop: function(){
        var $toTop = $(".gotop");

        $(window).on("scroll", function(){
            if($(window).scrollTop() >= $(window).height()){
                $toTop.css("display", "block").fadeIn();
            } else {
                $toTop.fadeOut();
            }
        });

        $toTop.on("click", function(evt){
            var $obj = $("body");
            $obj.animate({
                scrollTop: 0
            }, 240);

            evt.preventDefault();
        });
    },

    // 字体修改
    fontChange: function(){
        $(".font-type").on("click", function(){
            $(this).parent().find("a")
            .toggleClass("font-type-song")
            .toggleClass("font-type-hei");

            $("body").toggleClass("post-font-song");
        });
        $(".bg-type").on("click", function(){
            $(this).parent().find("a")
            .toggleClass("font-type-song")
            .toggleClass("font-type-hei");

            $("body").toggleClass("body-bg-moon");
        });
    }
};

var decoration = {
    init: function(){
        this.initNav();
        this.consoleCtt();
        this.menuIndex($('.post'));
        this.navTurner();
        this.sidebarNav();
    },
    initNav: function(){
        var $nav = $('.arrow-expend');
        if(!$nav.length || !$nav.find("li").length) return;
        var $ul = $nav.find("ul");
        $nav.show().on("mouseenter", function(){
            $ul.slideDown(300);
        }).on("click", function(evt){
            evt.stopPropagation();
            $ul.slideToggle(300);
        });
        $("body").on("click touchstart", function(evt){
            var $target = $(evt.target);
            if($target.hasClass("arrow-expend") || $target.parent(".arrow-expend").length) {
                // ...
            } else {
                $ul.slideUp(300);
            }
        });
        if(!$(".container .article").length) return;
        if(window.innerHeight <= 550) {
            $ul.slideUp(300);
        }
        $(window).on("resize", function(){
            if(window.innerHeight > 550) {
                $ul.slideDown(300);
            } else {
                $ul.slideUp(300);
            }
        });
    },
    // console 简介
    consoleCtt: function(){
        if(window.console&&window.console.log) {
            // var url = "http://" + window.location.host;
            // console.log("\n\n\n\n\n\n\n\n\n\n%c", "background:url('" + url + "/avatar150.png'); background-repeat:no-repeat; font-size:0; line-height:30px; padding-top:150px;padding-left:150px;");
            $(window).on("load", function(){
                $.getScript("/console.js");
            });
        }
    },
    // 鼠标移动添加效果
    sidebarNav: function(){
        var left = 48;
        if(operation.isIE()) {
            left = 90;
        }
        $(".sidebar").mouseenter(function(){
            $(this).addClass("sidebar-hover");
        }).mouseleave(function(){
            $(this).removeClass("sidebar-hover");
        });
        $(".func-item").mouseenter(function(){
            $(this).children("div").css({
                "left": left,
                "opacity": "0",
                "display": "block"
            }).clearQueue().show().stop().animate({
                "left": left - 15,
                "opacity": "1"
            }, "fast");
        }).mouseleave(function(){
            $(this).children("div").stop().delay().animate({
                "left": left,
                "opacity": "0"
            }, "fast", function(){
                $(this).hide()
            });
        });
    },
    // 导航树
    menuIndex: function($obj){
        if($('h3',$obj).length > 2 && !isMobile.any()){
            var h3 = [],h4 = [],tmpl = '<ul>',h3index = 0;

            $.each($('h3,h4',$obj),function(index,item){
                if(item.tagName.toLowerCase() == 'h3'){
                    var h3item = {};
                    h3item.name = $(item).text();
                    h3item.id = 'menuIndex'+index;
                    h3.push(h3item);
                    h3index++;
                }else{
                    var h4item = {};
                    h4item.name = $(item).text();
                    h4item.id = 'menuIndex'+index;
                    if(!h4[h3index-1]){
                        h4[h3index-1] = [];
                    }
                    h4[h3index-1].push(h4item);
                }
                item.id = 'menuIndex' + index
            });

            //添加h1
            tmpl += '<li class="h1"><a href="#" data-top="0">'+$('h1').text()+'</a></li>';

            for(var i=0;i<h3.length;i++){
                tmpl += '<li><a href="#" data-id="'+h3[i].id+'">'+h3[i].name+'</a></li>';
                if(h4[i]){
                    for(var j=0;j<h4[i].length;j++){
                        tmpl += '<li class="h4"><a href="#" data-id="'+h4[i][j].id+'">'+h4[i][j].name+'</a></li>';
                    }
                }
            }
            tmpl += '</ul>';

            $('body').append('<div id="menuIndex"></div>');
            $('#menuIndex').append($(tmpl)).delegate('a','click',function(e){
                e.preventDefault();
                var scrollNum = $(this).attr('data-top') || $('#'+$(this).attr('data-id')).offset().top;
                //window.scrollTo(0,scrollNum-30);
                $('body, html').animate({ scrollTop: scrollNum-30 }, 400, 'swing');
            })/*.append("<a href='javascript:void(0);' onclick='return false;' class='menu-unfold'>&gt;</a>");*/

            $(window).load(function(){
                var scrollTop = [];
                $.each($('#menuIndex li a'),function(index,item){
                    if(!$(item).attr('data-top')){
                        var top = $('#'+$(item).attr('data-id')).offset().top;
                        scrollTop.push(top);
                        $(item).attr('data-top',top);
                    }
                });

                var waitForFinalEvent = (function () {
                    var timers = {};
                    return function (callback, ms, uniqueId) {
                        if (!uniqueId) {
                            uniqueId = "Don't call this twice without a uniqueId";
                        }
                        if (timers[uniqueId]) {
                            clearTimeout (timers[uniqueId]);
                        }
                        timers[uniqueId] = setTimeout(callback, ms);
                    };
                })();

                $(window).scroll(function(){
                    waitForFinalEvent(function(){
                        var nowTop = $(window).scrollTop(),index,length = scrollTop.length;
                        if(nowTop+60 > scrollTop[length-1]){
                            index = length
                        }else{
                            for(var i=0;i<length;i++){
                                if(nowTop+60 <= scrollTop[i]){
                                    index = i
                                    break;
                                }
                            }
                        }
                        $('#menuIndex li').removeClass('on')
                        $('#menuIndex li').eq(index).addClass('on')
                    })
                });
            });

            //用js计算屏幕的高度
            $('#menuIndex').css('max-height',$(window).height()-80);
        }
    },

    // 导航栏开关
    navTurner: function(){
        if($("#menuIndex a").size() < 3){
            $(".func-nav").parent().find("a")
                .text("首页瞧瞧~").parents(".func-item").off().on("click", function(){
                    window.location.href = "/";
                });
            $(".func-nav span").text("首页");
        } else {
            $(".func-nav").parent().on("click", function(){
                $("#menuIndex").slideToggle();
                var text = $(this).find("a").text() == "显示目录" ? "隐藏目录" : "显示目录";
                $(this).find("a").text(text);
            });
        }
    },

    refreshComments: function(){
        var ret = {};
        $(".ds-comment-body p").each(function(){
            var text = $(this).text();
            if(new RegExp("\\/_p(\\d+)_t(\\d)").test(text)) {
                if(ret[RegExp.$1]) {
                    ret[RegExp.$1]++;
                } else {
                    ret[RegExp.$1] = 1;
                }
            }
        });
        $(".post-content>p").each(function(i){
            if(ret[i]) {
                var $cmt = $(this).find(".a-comments");
                if(!$cmt.attr("data-num")) {
                    $cmt.attr("data-num", ret[i]).addClass("a-comments_on");
                }
            }
        });
    }
};

$(function(){
    // 初始化项目
    operation.init();
    decoration.init();
    $(".highlight").parent(".highlight").removeClass("highlight");
    $("code").removeClass("highlight").each(function(){
        var $hasB = $(this).parent(".highlight");
        var $hasP = $(this).parent("pre");
        if(!$hasB.size() && $hasP.size()){
            $hasP.wrap("<div class='highlight'></div>");
        }
    })
});

$(window).on("load", function(){

    duoshuoName = $(".ds-thread").attr("data-name");
    window.duoshuoQuery = {short_name: duoshuoName};
    if(window.duoshuoQuery.short_name){
        $.getScript((document.location.protocol == 'https:' ? 'https:' : 'http:') + '//static.duoshuo.com/embed.js', function(){
            operation.welcome();
        });
    } else {
        operation.welcome();
    }

    window.disqus_shortname = disqusName = $("#disqus_thread").attr("data-disqus-name");
    if(disqus_shortname){
        $.getScript('//' + disqus_shortname + '.disqus.com/embed.js', function(){
            operation.welcome();
            $.getScript('//' + disqus_shortname + '.disqus.com/count.js');
        });
    } else {
        operation.welcome();
    }

    var $wb = $("#followMeOnWeibo");
    if($wb.size() > 0 && !$wb.attr("loaded")){
        $wb.parent().on("mouseenter", function(){
            $wb.parent().off();
            $wb.attr("loaded", 1);
            // weibo
            $("html").attr("xmlns:wb", "http://open.weibo.com/wb");
            $("head").append('<script src="http://tjs.sjs.sinajs.cn/open/api/js/wb.js" type="text/javascript" charset="utf-8"></script>');
            $("#followMeOnWeibo").html('<wb:follow-button uid="5444848999" type="red_1" width="67" height="24" style="vertical-align:middle;display:inline-block" ></wb:follow-button>');
        });
    }

    setTimeout(function(){
        //百度流量统计
        var _hmt = _hmt || [];
        (function() {
            var hm = document.createElement("script");
            hm.src = "//hm.baidu.com/hm.js?fd00e32b4ab660903ed5736c5878bc2d";
            var s = document.getElementsByTagName("script")[0];
            s.parentNode.insertBefore(hm, s);
        })();

        //google流量统计
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
        ga('create', 'UA-72634417-1', 'auto');
        ga('send', 'pageview');

    }, 2000);
});



$(function(){
    var $layer = $("<div/>").css({
        position: "fixed",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        height: "100%",
        width: "100%",
        zIndex: 9,
        background: "#000",
        opacity: "0.6",
        display: "none"
    }).attr("data-id", "b_layer");
    var cloneImg = function($node) {
        var left = $node.offset().left;
        var top = $node.offset().top - $(window).scrollTop();
        var nodeW = $node.width();
        var nodeH = $node.height();
        return $node.clone().css({
            position: "fixed",
            width: nodeW,
            height: nodeH,
            left: left,
            top: top,
            zIndex: 10
        });
    };
    var justifyImg = function($c) {
        var dW = $(window).width();
        var dH = $(window).height();
        $c.css("cursor", "move").attr("data-b-img", 1);
        var img = new Image();
        img.onload = function(){
            var width = this.width >= dW - 18 ? dW - 18 : this.width;
            var height = this.height / this.width * width;
            $c.stop().animate({
                width: width ,
                height: height,
                left: (dW - width) / 2,
                top: (dH - height) / 2
            }, 300);
        };
        img.src = $c.attr("src");
    };

    $(".post-content img").css("cursor", "zoom-in").on("click", function(evt){
        // if($(this).parent("a").size()) {
        //   return;
        // }
        evt.preventDefault();
        evt.stopPropagation();
        var $b = $("body");
        $layer.appendTo($b);
        $layer.fadeIn(300);
        var $c = cloneImg($(this));
        $c.appendTo($b);
        justifyImg($c);
    }).each(function(){
        // if($(this).parent("a").size()) {
        //   $(this).css('cursor', 'inherit');
        //   return;
        // }
    });

    var timer = null;
    $(window).on("resize", function(){
        $("img[data-b-img]").each(function(){
            var $this = $(this);
            timer && clearTimeout(timer);
            timer = setTimeout(function(){
                justifyImg($this);
            }, 10);
        });
    });

    var $body = $("body");
    var moving = false;
    $body.on("mousedown touchstart", "img[data-b-img]", function(evt){
        evt.stopImmediatePropagation();
        var $target = $(evt.target);
        var oX = evt.pageX;
        var oY = evt.pageY;
        $target.prop("draggable", false);
        $body.on("mousemove touchmove", function(evt){
            evt.stopImmediatePropagation();
            moving = true;
            var dX = evt.pageX - oX;
            var dY = evt.pageY - oY;
            oX = evt.pageX;
            oY = evt.pageY;
            $target.css({
                left: "+=" + dX,
                top: "+=" + dY
            });
        });
        $body.on("mouseup mouseleave touchend touchcancel", function(evt){
            evt.stopImmediatePropagation();
            setTimeout(function(){
                moving = false;
            }, 300);
            $target.removeProp("draggable");
            $body.off("mousemove mouseup mouseleave touchmove touchend touchcancel");
        });
    });

    $(window).on("click keydown touchstart", function(evt){
        if(moving) return;
        if(evt.type == "keydown" && evt.keyCode === 27) {
            $layer.fadeOut(300);
            $("img[data-b-img]").remove();
        }
        var $this = $(evt.target);
        if($this.attr("data-id") == "b_layer" || $this.attr("data-b-img") == 1) {
            $layer.fadeOut(300);
            $("img[data-b-img]").remove();
        } else if($("img[data-b-img]").size()) {
            $layer.fadeOut(300);
            $("img[data-b-img]").remove();
        }
    });
});

$(function(){
var fixerrRunning = false;
var fixerrTimer = null;
$(".fixerr").on("c:fire", function(){
    var $this = $(this);
    if(fixerrRunning) return;

    if($this.attr("data-switch") == "on") {
        $this.attr("data-switch", "off");

        $this.text("关闭中...");
        setTimeout(function(){
            fixerrRunning = false;
            $(".a-comments").remove();
            clearTimeout(fixerrTimer);
            $this.text("已关闭");
        }, 400);
        return;
    }
    $this.attr("data-switch", "on");
    fixErr();
    $this.text("开启中...");
    setTimeout(function(){
        fixerrRunning = false;
        $this.text("已开启");
    }, 400);
    fixerrTimer = setInterval(function(){
        decoration.refreshComments();
    }, 2000);
}).trigger("c:fire");
/**/ function fixErr(){ /**/
$("<div class='comments-layer' id='commentsLayer'>" +
    "<p class='comments-btns'>" +
        "<span class='comments-type-err on'>我要纠错</span>" +
        "<span class='comments-type-q'>我有话说</span>" +
        "<i class='icon close'>&#xe624;</i>" +
    "</p>" +
    "<div><textarea></textarea></div>" +
    "<p class='comments-btns comment-btns-right'>" +
        "<b class='comments-info'></b>" +
        "<span class='comments-btns-cancel'>取消</span>" +
        "<span class='comments-btns-submit'>提交</span>" +
    "</p>" +
  "</div>").hide().appendTo($("body"));
var $layer = $("#commentsLayer");
$(".post-content>p").append("<i class='icon a-comments' title='我有疑问'>&#xe607;<b>我要说话</b></i>");
$(".a-comments").on("click", function(){
    var cancelEffect = $(window).width() <= 640;
    var $p = $(this).parent("p");
    var pw = $p.width();
    var ph = $p.height();
    $(".comments_on").removeClass("comments_on");
    $p.addClass("comments_on");
    if($p.find("#commentsLayer").size()) {
        $layer.animate({
            left: pw + 20
        }, cancelEffect ? 0 : "fast", function(){
            $layer.hide().appendTo($("body"));
        }).find("textarea").val("");
        $("#commentsLayer ul").remove();
        return;
    }
    $layer.appendTo($p).show().css({
        top: cancelEffect ? 0 : ph,
        left: pw + 20,
        opacity: 0
    }).animate({
        left: -1,
        opacity: 1
    }, cancelEffect ? 0 : "fast");

    var index = 0;
    $(".post-content>p").each(function(i){
        if($(this).hasClass("comments_on")) {
            index = i;
        }
    });
    var ret = [];
    $(".ds-comment-body p").each(function(){
        var text = $(this).text();
        if(new RegExp("\\/_p" + index + "_t(\\d)").test(text)) {
            ret.push({
                type: RegExp.$1 == 1 ? " 对邹成卓说：" : " 的纠错：",
                text: text.split(" /_p")[0],
                author: $(this).prev().text(),
                avatar: $(this).parent().prev().find("img").attr("src")
            });
        }
    });
    if(ret.length) {
        var str = "<ul>";
        $.each(ret, function(i, item){
            if(item.author == "邹成卓" && item.avatar.indexOf("5444848999") > -1 && i !== 0) {
                var isMe = true;
            }
            str += '<li' + (isMe ? " style='margin-left:30px'" : "") + '><img src="' +
                    item.avatar + '" />' + item.author + item.type +
                    '<div>' + item.text + '</div></li>';
        });
        str += '</ul>';
        $("#commentsLayer").append(str);
    }

});
$(".comments-type-err, .comments-type-q").on("click", function(){
    $(this).parent().find("span").removeClass("on");
    $(this).addClass("on");
});
$(".comments-btns-submit, .comments-btns-cancel, .comments-btns .close").on("click", function(){
    var index = "_p0";
    if($(this).hasClass("comments-btns-submit")) {
        $(".post-content>p").each(function(i){
            if($(this).hasClass("comments_on")) {
                index = "_p" + i;
            }
        });
        var $cmt = $(".comments_on .a-comments");
        if($cmt.attr("data-num")) {
            $cmt.attr("data-num", +$cmt.attr("data-num") + 1);
        } else {
            $cmt.attr("data-num", 1).addClass("a-comments_on");
        }

        var type = "_t" + ($(".comments-type-err").hasClass("on") ? 0 : 1);
        var val = $layer.find("textarea").val();
        if(!$.trim(val)) {
            $(".comments-info").text("内容不能为空，亲~").hide().fadeIn("fast");
            return;
        }
        val += " /" + index + type;
        $("textarea[name='message']").val(val);
        $(".ds-post-button").trigger('click');
        var $target = $("#ds-wrapper");
        if($target.size()){
            var $clone = $target.clone(true).addClass("ds-wrapper-clone");
            $clone.css("opacity", 1).appendTo($("body"));
            $clone.find("button[type='submit']").off().on("click", function(){
                var author = $("#ds-dialog-name").val();
                var $form = $(".ds-replybox form");
                $form.find("input[name='author_name']").remove();
                $form.append("<input type='hidden' name='author_name' value='" + author +"'>");
                $.post("http://zoucz.duoshuo.com/api/posts/create.json", $form.serialize(), function(){
                    $clone.remove();
                    $(".comments-info").text("提交成功").hide().fadeIn("fast");
                    setTimeout(function(){
                        postSuccess();
                    }, 600);
                });
            });
            $clone.find(".ds-dialog-close").off().on("click", function(){
                $clone.remove();
            });
        } else {
            $(".comments-info").text("提交成功").hide().fadeIn("fast");
            setTimeout(function(){
                postSuccess();
            }, 600);
        }
        return;

    }
    postSuccess();
});

function postSuccess(){
    $layer.fadeOut("fast", function(){
        $layer.appendTo($("body"));
    }).find("textarea").val("");
    $("#commentsLayer ul").remove();
    $(".comments-info").text("");
    decoration.refreshComments();
}
/**/}/**/
});
