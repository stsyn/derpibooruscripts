/*
*
*   This file has content which was produced by deobfuscation of Derpibooru's application.js.
*
*/

function processor(f, a) {
    let t = {
        set: function(a, b) {
            try {
                return localStorage.setItem(a, JSON.stringify(b)),
                !0
            } catch (c) {
                return !1
            }
        },
        get: function(a) {
            a = localStorage.getItem(a);
            try {
                return JSON.parse(a)
            } catch (b) {
                return a
            }
        },
        remove: function(a) {
            try {
                return localStorage.removeItem(a),
                !0
            } catch (b) {
                return !1
            }
        },
        watch: function(a, b) {
            var c = this;
            window.addEventListener("storage", function(d) {
                d.key === a && b(c.get(a))
            })
        },
        setWithExpireTime: function(a, b, c) {
            var d = a + "__lastUpdated";
            c = Date.now() + c;
            this.set(a, b) && this.set(d, c)
        },
        hasExpired: function(a) {
            a = this.get(a + "__lastUpdated");
            return Date.now() > a ? !0 : !1
        }
    };
    let querySelectAll = function (a, b) {
        void 0 === b && (b = document);
        a = b.querySelectorAll(a);
        return [].slice.call(a)
    }
    let I = function (a) {
        return a.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;")
    }
    let H = function () {
        for (var a = [], b = arguments.length; b--; )
            a[b] = arguments[b];
        (c = []).concat.apply(c, a).forEach(function(a) {
            for (; a.firstChild; )
                a.removeChild(a.firstChild)
        });
        var c
    }
    let Qa = function (a) {
        return a.filter(function(a, c, d) {
            return d.indexOf(a) === c
        })
    }
    let Ra = function (a, b, c) {
        return b.spoiler_image_uri && c.spoiler_image_uri ? a ? c.images - b.images : b.images - c.images : b.spoiler_image_uri || c.spoiler_image_uri ? b.spoiler_image_uri ? -1 : 1 : c.images - b.images
    }
    let Ea = function (a) {
        var b = t.get("bor_tags_" + a);
        return b ? b : {
            id: a,
            name: "(unknown tag)",
            images: 0,
            spoiler_image_uri: null
        }
    }
    let ia = function (a) {
        var b = a.dataset.size
          , c = JSON.parse(a.dataset.uris)
          , d = c[b].replace(/webm$/, "gif")
          , e = a.querySelector("picture");
        if (!e)
            return b = a.dataset.size,
            b = JSON.parse(a.dataset.uris)[b],
            (c = a.querySelector("video")) ? (d = a.querySelector("img"),
            !d || d.classList.contains("hidden") ? a = !1 : (d.classList.add("hidden"),
            c.innerHTML = '\n    <source src="' + b + '" type="video/webm"/>\n    <source src="' + b.replace(/webm$/, "mp4") + '" type="video/mp4"/>\n  ',
            c.classList.remove("hidden"),
            c.play(),
            a.querySelector(".js-spoiler-info-overlay").classList.add("hidden"),
            a = !0)) : a = !1,
            a;
        e = e.querySelector("img");
        if (!e || -1 !== e.src.indexOf(d))
            return !1;
        t.get("serve_hidpi") && !d.endsWith(".gif") && (e.srcset = d + " 1x, " + c.medium + " 2x");
        e.src = d;
        -1 !== c[b].indexOf(".webm") ? (a = a.querySelector(".js-spoiler-info-overlay"),
        a.classList.remove("hidden"),
        a.innerHTML = "WebM") : a.querySelector(".js-spoiler-info-overlay").classList.add("hidden");
        return !0
    }
	let unspoilImage = function (a) {
        a.querySelector(".image-filtered").classList.add("hidden");
        a = a.querySelector(".image-show").classList;
        a.remove("hidden");
        a.add("spoiler-pending")
    }
    let P = function (a, b, c) {
        var d = a.querySelector("picture");
        if (d)
            d = d.querySelector("img"),
            a = a.querySelector(".js-spoiler-info-overlay"),
            d && -1 === d.src.indexOf(b) && (d.srcset = "",
            d.src = b,
            a.innerHTML = c,
            a.classList.remove("hidden"));
        else if (d = a.querySelector("video")) {
            var e = a.querySelector("img");
            a = a.querySelector(".js-spoiler-info-overlay");
            e && (e.classList.remove("hidden"),
            e.src = b,
            a.innerHTML = c,
            a.classList.remove("hidden"),
            H(d),
            d.classList.add("hidden"),
            d.pause())
        }
    }
    let spoilerHandler = function (a, b, c) {
        P(a, b, c);
        switch (window.booru.spoilerType) {
        case "click":
            a.addEventListener("click", function(b) {
                ia(a) && b.preventDefault()
            });
            a.addEventListener("mouseleave", function() {
                return P(a, b, c)
            });
            break;
        case "hover":
            a.addEventListener("mouseenter", function() {
                return ia(a)
            }),
            a.addEventListener("mouseleave", function() {
                return P(a, b, c)
            })
        }
    }
    let filterImage = function (a, b, c) {
        var d = a.querySelector(".image-filtered img")
          , e = a.querySelector(".filter-explanation");
        d && (d.src = b,
        e.innerHTML = c,
        a.querySelector(".image-show").classList.add("hidden"),
        a.querySelector(".image-filtered").classList.remove("hidden"))
    }
	let getHidddenTags = function () {
        return Qa(window.booru.hiddenTagList).map(function(a) {
            return Ea(a)
        }).sort(Ra.bind(null, !0))
    }
    let getSpoileredTags = function () {
        return "off" === window.booru.spoilerType ? [] : Qa(window.booru.spoileredTagList).filter(function(a) {
            return -1 === window.booru.ignoredTagList.indexOf(a)
        }).map(function(a) {
            return Ea(a)
        }).sort(Ra.bind(null, !1))
    }
    let hasTags = function (a, b) {
        var c = JSON.parse(a.dataset.imageTags);
        return b.filter(function(a) {
            return -1 !== c.indexOf(a.id)
        })
    }
    let Sa = function (a) {
        var b = a[0];
        a = a.slice(1);
        b = I(b.name);
        0 < a.length && (a = a.map(function(a) {
            return I(a.name)
        }).join(", "),
        b += '<span title="' + a + '">, ' + a + "</span>");
        return b
    }
    let isSpoilered = function (a, b, c) {
        if (!b || 0 === b.length)
            return !1;
        c(a, b);
        window.booru.imagesWithDownvotingDisabled.push(a.dataset.imageId);
        return !0
    }
    let hiddenImageProtoShort = function (a, b) {
        P(a, b[0].spoiler_image_uri || window.booru.hiddenTag, "[HIDDEN] " + Sa(b))
    }
    let spoileredImageProtoShort = function (a, b) {
        spoilerHandler(a, b[0].spoiler_image_uri || window.booru.hiddenTag, Sa(b))
    }
    let hiddenComplexImageProtoShort = function (a) {
        P(a, window.booru.hiddenTag, "[HIDDEN] <i>(Complex Filter)</i>")
    }
    let spoileredComplexImageProtoShort = function (a) {
        spoilerHandler(a, window.booru.hiddenTag, "<i>(Complex Filter)</i>")
    }
    let hiddenImageProto = function (a, b) {
        filterImage(a, b[0].spoiler_image_uri || window.booru.hiddenTag, "This image is tagged <code>" + I(b[0].name) + "</code>, which is hidden by ")
    }
    let spoileredImageProto = function (a, b) {
        filterImage(a, b[0].spoiler_image_uri || window.booru.hiddenTag, "This image is tagged <code>" + I(b[0].name) + "</code>, which is spoilered by ")
    }
    let hiddenComplexImageProto = function (a) {
        filterImage(a, window.booru.hiddenTag, "This image was hidden by a complex tag expression in ")
    }
    let spoileredComplexImageProto = function (a) {
        filterImage(a, window.booru.hiddenTag, "This image was spoilered by a complex tag expression in ")
    }
	let filterHandler = function (a) {
		void 0 === a && (a = document);
		var b = getHidddenTags()
		  , c = getSpoileredTags()
		  , d = window.booru
		  , e = d.hiddenFilter
		  , f = d.spoileredFilter;
		querySelectAll(".image-container", a).filter(function(a) {
			return !isSpoilered(a, hasTags(a, b), hiddenImageProtoShort)
		}).filter(function(a) {
			return !isSpoilered(a, e.hitsImage(a), hiddenComplexImageProtoShort)
		}).filter(function(a) {
			return !isSpoilered(a, hasTags(a, c), spoileredImageProtoShort)
		}).filter(function(a) {
			return !isSpoilered(a, f.hitsImage(a), spoileredComplexImageProtoShort)
		}).forEach(function(a) {
			return ia(a)
		});
		querySelectAll(".image-show-container", a).filter(function(a) {
			return !isSpoilered(a, hasTags(a, b), hiddenImageProto)
		}).filter(function(a) {
			return !isSpoilered(a, e.hitsImage(a), hiddenComplexImageProto)
		}).filter(function(a) {
			return !isSpoilered(a, hasTags(a, c), spoileredImageProto)
		}).filter(function(a) {
			return !isSpoilered(a, f.hitsImage(a), spoileredComplexImageProto)
		}).forEach(function(a) {
			return unspoilImage(a)
		})
	}

    //
	if (f == 'processImages') filterHandler(a[0]);
}

function DB_processImages(target) {
    processor('processImages', [target]);
}
