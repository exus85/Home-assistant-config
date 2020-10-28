/*!
 * Modern News Ticker v2.5.0
 * (c) CreativeTier
 * contact@creativetier.com
 * http://www.creativetier.com
 */
(function($) {
"use strict";

// Default settings
var defaults = {
	effect: "scroll",
	randomOrder: false,
	centerAlign: false,
	linksEnabled: true,
	pauseOnHover: true,
	autoplay: true,
	feedType: "none",
	feedCount: 5,
	linkTarget: "_blank",
	refresh: "10:00",
	direction: "ltr"
};

// Default effect settings
var effectDefaults = {
	scroll: {
		scrollType: "continuous",
		scrollStart: "inside",
		scrollInterval: 20,
		transitionTime: 500
	},
	fade: {
		displayTime: 4000,
		transitionTime: 300
	},
	type: {
		typeInterval: 10,
		displayTime: 4000,
		transitionTime: 300
	},
	slide: {
		slideDistance: 100,
		displayTime: 4000,
		transitionTime: 350
	}
};

// Default feed settings
var feedDefaults = {
	"rss": {
		feedUrl: "",
		loadType: "direct",
		loadProcess: "rss2json",
		forceNoCache: false,
		rssLoadFile: "modern-ticker/php/load-rss.php",
		rss2jsonApiKey: null
	},
	"json": {
		feedUrl: "",
		forceNoCache: false,
		jsonLoadFile: "modern-ticker/php/load-json.php"
	},
	"twitter": {
		twitterName: "",
		twitterLoadFile: "modern-ticker/php/load-twitter.php",
		twitterExcludeReplies: false,
		twitterIncludeRetweets: false
	}
};

// Feed error messages that will be displayed in the ticker.
// Apart from these, error messages thrown by jQuery.ajax, rss2json and Twitter are also shown.
var feedMessages = {
	"label": "Error",
	"noRssLoadFile": "RSS load file not found.",
	"noJsonLoadFile": "JSON load file not found.",
	"noTwitterLoadFile": "Twitter load file not found.",
	"noFile": "File not found.",
	"empty": "Empty response.",
	"noError": "No message returned. See the browser console."
};

// The methods of the ticker.
var methods = {
	
	// Initializes the ticker.
	init: function(options) {
		
		// Create the settings.
		var settings = {};
		var v;

		if (options.feedType) {
			options.feedType = options.feedType.toLowerCase();
		}

		// Backward compatibility.
		if (options.feedType === "rss-atom") {
			options.feedType = "rss";
		}
		if (options.twitterLoadingFile) {
			options.twitterLoadFile = options.twitterLoadingFile;
		}
		if (options.processService) {
			options.loadProcess = options.processService;
		}

		if (options.loadProcess === "YQL") {
			options.loadProcess = "rss2json";
		}

		// Add effect defaults.
		if (options.effect) {
			v = options.effect;
		} else {
			v = defaults.effect;
		}
		
		$.extend(settings, effectDefaults[v]);

		// Add feed defaults.
		if (options.feedType) {
			v = options.feedType;
		} else {
			v = defaults.feedType;
		}

		$.extend(settings, feedDefaults[v]);

		// Add defaults.
		$.extend(settings, defaults, options);


		// Build the ticker and return it.
		return this.each(function() {
			
			// PROPS

			// Declare vars
			var listWidth;
			var newsWidth;
			var newsPositions;
			var playInterval;
			var playing = false;
			var paused = false;
			var transitioning = false;
			var mousingOver = false;
			var firstTime = true;
			var isReady = false;
			var refreshTimeout;
			var isRTL = false;

			// Get objects
			var ticker = $(this);
			var body = ticker.children(".mt-body");
			var label = body.children(".mt-label");
			var news = body.children(".mt-news");
			var list = news.children("ul");
			var originalNews = list.children("li");
			var controls = body.children(".mt-controls");
			var prevArrow = controls.children(".mt-prev");
			var nextArrow = controls.children(".mt-next");
			var playButton = controls.children(".mt-play");

			
			// INIT

			if (settings.direction === "rtl") {
				isRTL = true;
				ticker.addClass("mt-rtl");
			} else {
				ticker.addClass("mt-ltr");
			}
			
			// Prepare layout for scroll
			if (settings.effect == "scroll") {
				ticker.addClass("mt-scroll");
			}
			
			// Position the news.
			if (label.length) {
				label.width(getRealWidth(label));
				news.css(isRTL ? "right" : "left", Math.round(label.outerWidth(true)));
			}
			
			// Set news dimensions
			setNewsWidth();
			news.css("height", Math.round(ticker.height() - 2 * parseInt(body.css("margin-top"))));

			// Update news with when the window is resized.
			$(window).resize(function() {
				setNewsWidth();

				if (settings.effect !== "scroll" && settings.centerAlign) {
					centerAlign();
				}
			});
			
			// Get the positions of the news items
			if (settings.scrollType === "discontinuous") {
				newsPositions = [];
				
				var c = 0;
				list.children().each(function() {
					newsPositions.push(c);
					c += $(this).outerWidth();
				});
			}
			
			// Disable the news links if required
			if (!settings.linksEnabled) {
				list.find("a").removeAttr("href target");
			}
			
			// News pause on hover
			if (settings.pauseOnHover)
				news.hover(function() {
					if (isReady) {
						pausePlay();
						mousingOver = true;
					}
				}, function() {
					if (isReady) {
						mousingOver = false;
						resumePlay();
					}
				});
			
			if (controls.length) {
				// Arrows behaviour
				prevArrow.mousedown(preventDefault).bind("click", {type: "prev"}, arrowClick);
				nextArrow.mousedown(preventDefault).bind("click", {type: "next"}, arrowClick);
				
				// Play button behaviour
				playButton.mousedown(preventDefault).click(function() {
					if (isReady) {
						if (playing) {
							stopPlay();
							displayPlay();
						} else {
							startPlay();
							displayPause();
						}
					}
				});
			}
			
			// Get feed if necessary
			if (settings.feedType === "rss" || settings.feedType === "json" || settings.feedType === "twitter") {
				loadFeed();
			} else {
				ready();
			}


			// FUNCTIONS

			function setNewsWidth() {
				var w = body.width();
				if (label.length) {
					w -= label.outerWidth(true);
				}
				if (controls.length) {
					w -= controls.outerWidth(true);
				}
				w = Math.round(w);
				news.css("width", w);
				newsWidth = w;
			}
			
			function resizeList() {
				listWidth = 0;
				list.children().each(function() {
					listWidth += $(this).outerWidth(true) + 1;
				});
				list.css("width", listWidth);
			}
			
			// Loads and displays the feeds
			function loadFeed() {
				
				pausePlay();

				// Hide the list in case there are default news.
				list.addClass("mt-hide");

				// Show the preloader.
				news.addClass("mt-preloader");
				
				// Remove previous loaded news
				list.children().remove();

				// Reset the original news, if any.
				list.css(isRTL ? "margin-right" : "margin-left", 0);
				originalNews.css("opacity", "1").removeClass("mt-hide");
				list.append(originalNews);

				if (settings.feedType === "rss" || settings.feedType === "json") {
					var feedUrl = settings.feedUrl;

					// Append a unique number at the end of the url, to always make it look unique and bypass the cache.
					if (settings.forceNoCache) {
						if (feedUrl.indexOf("?") === -1) {
							feedUrl += "?";
						} else {
							feedUrl += "&";
						}
						feedUrl += Math.random().toString();
					}
				}

				switch (settings.feedType) {
					case "rss":
						if (settings.loadType === "process") {
							if (settings.loadProcess !== "rss2json") {
								feedUrl = encodeURIComponent(feedUrl);
							}
							
							if (settings.loadProcess === "rss2json") {

								var rss2jsonParams = {
									rss_url: feedUrl
								};

								if (settings.rss2jsonApiKey) {
									rss2jsonParams.api_key = settings.rss2jsonApiKey;
								}

								$.ajax({
									url: "https://api.rss2json.com/v1/api.json",
									type: "GET",
									data: rss2jsonParams,
									dataType: "json",
									success: function(data, textStatus, jqXHR) {
										if (data.status === "ok") {
											displayNewsItems(data.items);
											loadComplete();
										} else {
											displayError(data.message, "rss2json");
										}
									},
									error: function(jqXHR, textStatus, errorThrown) {
										ajaxError(errorThrown, feedMessages.noFile);
									}
								});

							} else {
								
								$.ajax({
									url: settings.rssLoadFile,
									type: "GET",
									data: {
										url: feedUrl
									},
									dataType: "json",
									success: function(data, textStatus, jqXHR) {
										if (data) {
											displayNewsItems(data.channel.item);
											loadComplete();
										} else {
											displayError(feedMessages.empty);
										}
									},
									error: function(jqXHR, textStatus, errorThrown) {
										ajaxError(errorThrown, feedMessages.noRssLoadFile);
									}
								});

							}
						} else {

							$.ajax({
								url: feedUrl,
								type: "GET",
								dataType: "xml",
								success: function(data, textStatus, jqXHR) {
									if (data) {
										displayNewsItems($(data).find("item"), "xml");
										loadComplete();
									} else {
										displayError(feedMessages.empty);
									}
								},
								error: function(jqXHR, textStatus, errorThrown) {
									ajaxError(errorThrown, feedMessages.noFile);
								}
							});

						}
						break;
					case "json":
						if (settings.loadType === "process") {

							$.ajax({
								url: settings.jsonLoadFile,
								type: "GET",
								data: {
									url: feedUrl
								},
								dataType: "json",
								success: function(data, textStatus, jqXHR) {
									if (data) {
										displayNewsItems(data.items);
										loadComplete();
									} else {
										displayError(feedMessages.empty);
									}
								},
								error: function(jqXHR, textStatus, errorThrown) {
									ajaxError(errorThrown, feedMessages.noJsonLoadFile);
								}
							});

						} else {

							$.ajax({
								url: settings.feedUrl,
								type: "GET",
								dataType: "json",
								success: function(data, textStatus, jqXHR) {
									if (data.status === "ok") {
										displayNewsItems(data.items);
										loadComplete();
									} else {
										displayError(data.message);
									}
								},
								error: function(jqXHR, textStatus, errorThrown) {
									ajaxError(errorThrown, feedMessages.noFile);
								}
							});

						}
						break;
					case "twitter":

						$.ajax({
							url: settings.twitterLoadFile,
							type: "GET",
							data: {
								screen_name: settings.twitterName,
								count: settings.feedCount,
								exclude_replies: settings.twitterExcludeReplies,
								include_retweets: settings.twitterIncludeRetweets
							},
							success: function(data, textStatus, jqXHR) {
								if (data) {
									data = $.parseJSON(data);
									if (!data.errors) {
										displayNewsItems(data, "twitter");
										loadComplete();
									} else {
										displayError(data.errors[0].message, "Twitter");
									}
								} else {
									displayError(feedMessages.empty);
								}
							},
							error: function(jqXHR, textStatus, errorThrown) {
								ajaxError(errorThrown, feedMessages.noTwitterLoadFile);
							}
						});

						break;
				}
			}

			function displayNewsItems(items, format) {
				var i, n, s;
				
				if (settings.feedCount === 0 || items.length <= settings.feedCount) {
					n = items.length;
				} else {
					n = settings.feedCount;
				}

				if (format === "xml") {

					for (i = 0; i < n; i++) {
						s = "<li>";
						
						if (settings.linksEnabled) {
							s += '<a href="' + items.eq(i).children("link").text() + '" target="' + settings.linkTarget + '">';
							s += items.eq(i).children("title").text();
							s += "</a>";
						} else {
							s += "<a>" + items.eq(i).children("title").text() + "</a>";
						}

						s += "</li>";
						
						list.append(s);
					}

				} else if (format === "twitter") {
					
					for (i = 0; i < n; i++) {
						s = "<li>";

						if (settings.linksEnabled) {
							s += '<a href="http://twitter.com/' + items[i].user.id_str + '/status/' + items[i].id_str + '" target="' + settings.linkTarget + '">';
							s += items[i].text;
							s += "</a>";
						} else {
							s += "<a>" + items[i].text + "</a>";
						}

						s += "</li>";
						
						list.append(s);
					}

				} else {
					
					for (i = 0; i < n; i++) {
						s = "<li>";

						if (settings.linksEnabled) {
							s += '<a href="' + items[i].link + '" target="' + settings.linkTarget + '">';
							s += items[i].title;
							s += "</a>";
						} else {
							s += "<a>" + items[i].title + "</a>";
						}

						s += "</li>";
						
						list.append(s);
					}

				}
			}

			function ajaxError(errorThrown, noFileError) {
				if (errorThrown === "Not Found") {
					displayError(noFileError);
				} else {
					displayError(errorThrown);
				}
			}

			function displayError(message, source) {
				news.removeClass("mt-preloader");

				var label;
				if (source) {
					label = source;
				} else {
					label = feedMessages.label;
				}
				label += ": ";

				if (!message) {
					message = feedMessages.noError;
				}

				var error = '<p class="mt-error">' + label + message + '</p>';
				news.append(error);
			}

			function loadComplete() {
				news.removeClass("mt-preloader");
				list.removeClass("mt-hide");

				ready();
			}

			function refresh() {
				if (settings.feedType === "rss" || settings.feedType === "json" || settings.feedType === "twitter") {
					clearTimeout(refreshTimeout);

					isReady = false;
					loadFeed();
				}
			}

			// The ticker is ready.
			function ready() {
				if (settings.randomOrder) {
					randomOrder();
				}

				// Set list width
				if (settings.effect === "scroll") {
					resizeList();
				}

				if (settings.effect !== "scroll" && settings.centerAlign) {
					centerAlign();
				}
				
				// Hide all of the next news if the effect is other than scroll.
				if (settings.effect != "scroll") {
					list.children("li:not(:first)").addClass("mt-hide");
				}

				// Start the autoplay, if enabled.
				if (firstTime) {
					firstTime = false;
					if (settings.autoplay) {
						startPlay();
						if (controls.length) {
							displayPause();
						}
					}
				} else {
					resumePlay();
				}

				show("first");

				if (settings.refresh) {
					refreshTimeout = setTimeout(refresh, convertTime(settings.refresh));
				}

				isReady = true;
			}

			function randomOrder() {
				var i, n;
				var items;

				items = list.children("li");
				items.remove();

				while (n = items.length) {
					i = getRandomInt(0, n - 1);

					list.append(items.eq(i));

					items.splice(i, 1);
				}
			}

			function centerAlign() {
				news.addClass("mt-center");

				list.children().each(function() {
					var item = $(this);
					var offset;

					offset = (news.width() - item.width()) / 2;

					if (offset < 0) {
						offset = 0;
					}
					
					if (isRTL) {
						item.css("right", offset);
					} else {
						item.css("left", offset);
					}
				});
			}

			function convertTime(time) {
				var n;

				if (typeof time == "number")
					n = time;
				else {
					var list = time.split(":");
					list.reverse();
					
					n = parseFloat(list[0]);
					if (list[1]) {
						n += parseFloat(list[1]) * 60;
					}
					if (list[2]) {
						n += parseFloat(list[2]) * 3600;
					}
				}

				return n * 1000;
			}

			// Arrows click behaviour
			function arrowClick(event) {
				if (isReady) {
					show(event.data.type);
				}
			}
			
			// Show prev/next news
			function show(type) {
				if (!transitioning) {
					var index, last, target;

					transitioning = true;
					pausePlay();
					
					switch (type) {
						case "first":

							switch (settings.effect) {
								case "scroll":
									
									if (settings.scrollStart === "outside") {
										list.css(isRTL ? "margin-right" : "margin-left", newsWidth);
									}
									
									resumePlay();
									
									break;
								case "fade":
								
									list.children(":first").css({"opacity": 0}).animate({"opacity": 1}, settings.transitionTime, function() {
										resumePlay();
									});

									break;
								case "type":
									
									if (isRTL) {
										rtlTypeText(list.children(":first").css({"opacity": 0}).animate({"opacity": 1}, settings.transitionTime).children("a"));
									} else {
										typeText(list.children(":first").css({"opacity": 0}).animate({"opacity": 1}, settings.transitionTime).children("a"));
									}
									
									break;
								case "slide":
									
									if (isRTL) {
										list.children(":first").css({"opacity": 0, "margin-right": settings.slideDistance}).animate({"opacity": 1, "margin-right": 0}, settings.transitionTime, function() {
											resumePlay();
										});
									} else {
										list.children(":first").css({"opacity": 0, "margin-left": settings.slideDistance}).animate({"opacity": 1, "margin-left": 0}, settings.transitionTime, function() {
											resumePlay();
										});
									}
									
									break;
							}

							transitioning = false;

							break;
						case "prev":

							switch (settings.effect) {
								case "scroll":

									if (isRTL) {
										if (settings.scrollType === "discontinuous") {
											index = getNewsIndex();
											last = newsPositions.length - 1;
											
											if (index === last) {
												list.animate({"margin-right": -listWidth}, settings.transitionTime, function() {
													list.css("margin-right", newsWidth);
													list.animate({"margin-right": 0}, settings.transitionTime, function() {
														transitioning = false;
													});
												});
											} else {
												target = -newsPositions[index + 1];

												list.animate({"margin-right": target}, settings.transitionTime, function() {
													transitioning = false;
												});
											}
										} else {
											list.animate({"margin-right": -($(list.children(":first")).outerWidth())}, settings.transitionTime, function() {
												list.css("margin-right", 0).children(":first").appendTo(list);
												transitioning = false;
											});
										}
									} else {
										if (settings.scrollType === "discontinuous") {
											index = getNewsIndex();
											last = newsPositions.length - 1;
											
											if (index === -1 || index === 0) {
												list.animate({"margin-left": newsWidth}, settings.transitionTime, function() {
													list.css("margin-left", -listWidth);
													list.animate({"margin-left": -newsPositions[last]}, settings.transitionTime, function() {
														transitioning = false;
													});
												});
											} else {
												target = -newsPositions[index - 1];

												list.animate({"margin-left": target}, settings.transitionTime, function() {
													transitioning = false;
												});
											}
										} else {
											list.css({"margin-left": -($(list.children(":last")).outerWidth())}).children(":last").prependTo(list);
											list.animate({"margin-left": 0}, settings.transitionTime, function() {
												transitioning = false;
											});
										}
									}
									
									if (controls.length) {
										prevArrow.mouseleave(function() {
											resumePlay();
										});
									}
									
									break;
								case "fade":
									
									list.children(":first").animate({"opacity": 0}, settings.transitionTime, function() {
										$(this).addClass("mt-hide");
										list.children(":last").prependTo(list).removeClass("mt-hide").css({"opacity": 0}).animate({"opacity": 1}, settings.transitionTime, function() {
											resumePlay();
										});
										
										transitioning = false;
									});
									
									break;
								case "type":
									
									if (isRTL) {
										list.children(":first").animate({"opacity": 0}, settings.transitionTime, function() {
											$(this).addClass("mt-hide");
											rtlTypeText(list.children(":last").prependTo(list).removeClass("mt-hide").css({"opacity": 0}).animate({"opacity": 1}, settings.transitionTime).children("a"));
											
											transitioning = false;
										});
									} else {
										list.children(":first").animate({"opacity": 0}, settings.transitionTime, function() {
											$(this).addClass("mt-hide");
											typeText(list.children(":last").prependTo(list).removeClass("mt-hide").css({"opacity": 0}).animate({"opacity": 1}, settings.transitionTime).children("a"));
											
											transitioning = false;
										});
									}
									
									break;
								case "slide":
									
									if (isRTL) {
										list.children(":first").animate({"opacity": 0}, settings.transitionTime, function() {
											$(this).addClass("mt-hide");
											list.children(":last").prependTo(list).removeClass("mt-hide").css({"opacity": 0, "margin-right": settings.slideDistance}).animate({"opacity": 1, "margin-right": 0}, settings.transitionTime, function() {
												resumePlay();
											});
											
											transitioning = false;
										});
									} else {
										list.children(":first").animate({"opacity": 0}, settings.transitionTime, function() {
											$(this).addClass("mt-hide");
											list.children(":last").prependTo(list).removeClass("mt-hide").css({"opacity": 0, "margin-left": settings.slideDistance}).animate({"opacity": 1, "margin-left": 0}, settings.transitionTime, function() {
												resumePlay();
											});
											
											transitioning = false;
										});
									}
									
									break;
							}

							break;
						case "next":

							switch (settings.effect) {
								case "scroll":

									if (isRTL) {
										if (settings.scrollType === "discontinuous") {
											index = getNewsIndex();
											last = newsPositions.length - 1;
											
											if (index === -1 || index === 0) {
												list.animate({"margin-right": newsWidth}, settings.transitionTime, function() {
													list.css("margin-right", -listWidth);
													list.animate({"margin-right": -newsPositions[last]}, settings.transitionTime, function() {
														transitioning = false;
													});
												});
											} else {
												if (index === -1) {
													target = 0;
												} else {
													target = -newsPositions[index - 1];
												}

												list.animate({"margin-right": target}, settings.transitionTime, function() {
													transitioning = false;
												});
											}
										} else {
											list.css({"margin-right": -($(list.children(":last")).outerWidth())}).children(":last").prependTo(list);
											list.animate({"margin-right": 0}, settings.transitionTime, function() {
												transitioning = false;
											});
										}
									} else {
										if (settings.scrollType === "discontinuous") {
											index = getNewsIndex();
											last = newsPositions.length - 1;
											
											if (index === last) {
												list.animate({"margin-left": -listWidth}, settings.transitionTime, function() {
													list.css("margin-left", newsWidth);
													list.animate({"margin-left": 0}, settings.transitionTime, function() {
														transitioning = false;
													});
												});
											} else {
												if (index === -1) {
													target = 0;
												} else {
													target = -newsPositions[index + 1];
												}

												list.animate({"margin-left": target}, settings.transitionTime, function() {
													transitioning = false;
												});
											}
										} else {
											list.animate({"margin-left": -($(list.children(":first")).outerWidth())}, settings.transitionTime, function() {
												list.css("margin-left", 0).children(":first").appendTo(list);
												transitioning = false;
											});
										}
									}
									
									if (controls.length) {
										nextArrow.mouseleave(function() {
											resumePlay();
										});
									}
									
									break;
								case "fade":
								
									list.children(":first").animate({"opacity": 0}, settings.transitionTime, function() {
										$(this).addClass("mt-hide").appendTo(list);
										list.children(":first").removeClass("mt-hide").css({"opacity": 0}).animate({"opacity": 1}, settings.transitionTime, function() {
											resumePlay();
										});
										
										transitioning = false;
									});
									
									break;
								case "type":

									if (isRTL) {
										list.children(":first").animate({"opacity": 0}, settings.transitionTime, function() {
											$(this).addClass("mt-hide").appendTo(list);
											rtlTypeText(list.children(":first").removeClass("mt-hide").css({"opacity": 0}).animate({"opacity": 1}, settings.transitionTime).children("a"));
											
											transitioning = false;
										});
									} else {
										list.children(":first").animate({"opacity": 0}, settings.transitionTime, function() {
											$(this).addClass("mt-hide").appendTo(list);
											typeText(list.children(":first").removeClass("mt-hide").css({"opacity": 0}).animate({"opacity": 1}, settings.transitionTime).children("a"));
											
											transitioning = false;
										});
									}
									
									break;
								case "slide":
									
									if (isRTL) {
										list.children(":first").animate({"opacity": 0}, settings.transitionTime, function() {
											$(this).addClass("mt-hide").appendTo(list);
											list.children(":first").removeClass("mt-hide").css({"opacity": 0, "margin-right": settings.slideDistance}).animate({"opacity": 1, "margin-right": 0}, settings.transitionTime, function() {
												resumePlay();
											});
											
											transitioning = false;
										});
									} else {
										list.children(":first").animate({"opacity": 0}, settings.transitionTime, function() {
											$(this).addClass("mt-hide").appendTo(list);
											list.children(":first").removeClass("mt-hide").css({"opacity": 0, "margin-left": settings.slideDistance}).animate({"opacity": 1, "margin-left": 0}, settings.transitionTime, function() {
												resumePlay();
											});
											
											transitioning = false;
										});
									}
									
									break;
							}

							break;
					}
				}
			}
			
			// Get the index of the current news item
			function getNewsIndex() {
				var p = parseFloat(isRTL ? list.css("margin-right") : list.css("margin-left"));
				var t = newsPositions.length;
				
				if (p > 0) {
					return -1;
				} else {
					p = Math.abs(p);
					
					for (var i = 0; i < t - 1; i++) {
						if (p >= newsPositions[i] && p < newsPositions[i + 1]) {
							return i;
						}
					}
					
					return t - 1;
				}
			}
			
			// Start autoplay
			function startPlay() {
				playing = true;
				
				if (settings.effect === "scroll") {
					
					playInterval = setInterval(function() {
						if (!transitioning) {
							var p;
							if (isRTL) {
								p = parseFloat(list.css("margin-right"));
								list.css("margin-right", p - 1);
								
								if (settings.scrollType === "discontinuous") {
									if (p < 0 && Math.abs(p) > listWidth) {
										list.css("margin-right", newsWidth);
									}
								} else {
									if (p < 0 && Math.abs(p) > $(list.children("li")[0]).outerWidth()) {
										list.css("margin-right", 0).children(":first").appendTo(list);
									}
								}
							} else {
								p = parseFloat(list.css("margin-left"));
								list.css("margin-left", p - 1);
								
								if (settings.scrollType === "discontinuous") {
									if (p < 0 && Math.abs(p) > listWidth) {
										list.css("margin-left", newsWidth);
									}
								} else {
									if (p < 0 && Math.abs(p) > $(list.children("li")[0]).outerWidth()) {
										list.css("margin-left", 0).children(":first").appendTo(list);
									}
								}
							}
						}
					}, settings.scrollInterval);
					
				} else {
					
					playInterval = setInterval(function() {
						show("next");
					}, settings.displayTime);
					
				}
			}
			// Stop autoplay
			function stopPlay() {
				playing = false;
				clearInterval(playInterval);
			}
			// Pause autoplay
			function pausePlay() {
				if (playing) {
					paused = true;
					stopPlay();
				}
			}
			// Resume autoplay
			function resumePlay() {
				if (paused && !mousingOver) {
					startPlay();
					paused = false;
				}
			}
			
			// Type each character of news
			function typeText(item) {
				stopType(item);

				var content = item.html();
				var chars = content.split("");
				var text = "_";
				var c = 0;

				item.html(text);

				var interval = setInterval(function() {
					var cont = true;
					var chr;
					var str = "";
					var inTag = false;
					var cc = 0;

					while (cont) {
						chr = chars[c++];
						str += chr;

						if (chr === "<") {
							inTag = true;
						}
						if (chr === ">") {
							inTag = false;
						}

						if (!inTag && chr !== ">") {
							cc++;
						}

						if (cc || c === chars.length) {
							cont = false;
						}
					}

					text = text.split("_")[0] + str;
					if (c !== chars.length) {
						text += "_";
					}
					item.html(text);

					if (c === chars.length) {
						clearInterval(interval);
						resumePlay();
					}
				}, settings.typeInterval);

				item.data("mt-type", {
					typing: true,
					content: content,
					interval: interval
				});
			}

			function rtlTypeText(item) {
				stopType(item);

				var content = item.html();
				var chars = content.split("");
				var text = "_";
				var c = 0;

				item.html(text);

				var interval = setInterval(function() {
					var cont = true;
					var chr;
					var str = "";
					var inTag = false;
					var cc = 0;

					while (cont) {
						chr = chars[c++];
						str += chr;

						if (chr === "<") {
							inTag = true;
						}
						if (chr === ">") {
							inTag = false;
						}

						if (!inTag && chr !== ">") {
							cc++;
						}

						if (cc || c === chars.length) {
							cont = false;
						}
					}

					text = text.split("_")[1] + str;
					if (c !== chars.length) {
						text = "_" + text;
					}
					item.html(text);

					if (c === chars.length) {
						clearInterval(interval);
						resumePlay();
					}
				}, settings.typeInterval);

				item.data("mt-type", {
					typing: true,
					content: content,
					interval: interval
				});
			}

			function stopType(item) {
				var data = item.data("mt-type");
				if (data && data.typing) {
					clearInterval(data.interval);
					item.html(data.content);
					item.data("mt-type").typing = false;
				}
			}
			
			// Display pause state on the play button
			function displayPause() {
				playButton.addClass("mt-pause");
			}
			// Display play state on the play button
			function displayPlay() {
				playButton.removeClass("mt-pause");
			}
			
			// Prevent default behaviour
			function preventDefault() {
				return false;
			}

			function getRealWidth(object) {
				return Math.ceil(object[0].getBoundingClientRect().width) - parseInt(object.css("padding-left")) - parseInt(object.css("padding-right"));
			}

			function getRandomInt(min, max) {
				min = Math.ceil(min);
				max = Math.floor(max);
				return Math.floor(Math.random() * (max - min + 1)) + min;
			}

			
			// Saves the pause and resume functions for external use
			ticker.data("pause", pausePlay);
			ticker.data("resume", resumePlay);
			ticker.data("refresh", refresh);
		});
	
	},
	
	// Pauses the autoplay.
	pause: function() {
		
		return this.each(function() {
			$(this).data("pause")();
		});
		
	},
	
	// Resumes the autoplay.
	resume: function() {
		
		return this.each(function() {
			$(this).data("resume")();
		});
		
	},

	// Refreshes the feed.
	refresh: function() {

		return this.each(function() {
			$(this).data("refresh")();
		});

	}

};

// Adds the ticker to the jQuery namespace.
$.fn.modernTicker = function(method) {
	
	// Method calling logic
	if (methods[method]) {
		return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
	} else if (typeof method === 'object' || !method) {
		return methods.init.apply(this, arguments);
	} else {
		$.error('Method ' +  method + ' does not exist on jQuery.modernTicker');
	}
	
};

})(jQuery);