var current_folder = null;

var displayTheme = null;

var mainWindow = null;

/*var results = {
	"folder": {
		"name": "folder",
		"isDir": true,
		"subFolder": {
			"newFolder":{
				"name": "newFolder",
				"isDir": true,
				"subFolder": []
			},
		}
	},
	"file":{
		"name": "file",
		"isDir": false,
		"url": "http://monurl"
	}

};*/
var results = null;

function setPopup(popup){
	mainWindow.innerHTML = "";
	mainWindow.appendChild(popup);
}

function init(){
        queryString = getQueryString();
	displayTheme = new WualaDisplay();
	mainWindow = document.getElementById("window_popup_id");
	$.ajax({
  		url: "browse.json",
  		success: function(result){
  			console.log("Got some things...")
			current_folder = "/";
			//Set the global variable
			results = result;
                        var path = queryString["path"];
                        if (undefined == path ){
                            path = "/";
                        }else{
                            path = "/" + path;

                        }
	                if ("/" != path.charAt(path.length - 1)){
	                	path = path + "/";
	                }
                        chroot = path;
			if (0 != window.location.hash.length){
                           path += window.location.hash.slice(2)
                        }
			display(path);
		},
                dataType:"json"
	});
	//display("/");
}
var queryString = null;
var chroot = "/";
function getQueryString() {
  var result = {}, queryString = location.search.slice(1),
      re = /([^&=]+)=([^&]*)/g, m;

  while (m = re.exec(queryString)) {
    result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
  }
  return result;
}

function display(path){
	if ("/" != path.charAt(path.length - 1)){
		path = path + "/";
	}
	displayTheme.GetBrowsingPathElement(path, display);
	var elementListObject = displayTheme.GetFilesListElement(path);
        console.log("chroot = !" + chroot + "!" + path + "!");
	if (chroot != path){
		displayTheme.AddElement(elementListObject, null, "..",
			function(event){
				var path = this;
				if ("/" == path.charAt(path.length - 1)){
					path = path.substr(0, path.length - 1);
				}
				var split = path.split("/");
				path = split.slice(0, split.length - 1).join("/");
				if (path == "")
				{
					path = "/";
				}
                                window.location = "#" + path.slice(chroot.length-1);
				display(path);
			}.bind(path)
		);
	}
	var tempResults = results;
	var splittedPath = path.split("/");
	splittedPath = splittedPath.slice(1, splittedPath.length -1);
	for (var i=0; i < splittedPath.length; i++){
		var debugElement = tempResults[splittedPath[i]];
		tempResults = debugElement.subFolder;
	}
	for(var element_key in tempResults){
		var element = tempResults[element_key];
		element_path = path + element.name;
		var downloadCB = null;
		var browseCB = null;
		var deleteCB = function(path, event){
			event.stopPropagation();
			setPopup(deletePopup(path));
		}.bind(element, element_path);

		if (element.isDir){
			browseCB = function(path, event){
                                if (this.subFolder && this.subFolder.hasOwnProperty("index.html")){
					window.open(this.subFolder["index.html"].url);
				}else{
                                        window.location = "#" + path.slice(chroot.length-1);
					display(path);
				}
			}.bind(element, element_path);
		}else{
			downloadCB = function(path, event){
				event.stopPropagation()
				console.log(this.url);
				window.open(this.url);
			}.bind(element, element_path);
		}
		displayTheme.AddElement(elementListObject, element, element.name, browseCB, downloadCB, deleteCB);
	}
	//browse_div.appendChild(ul);
	var mainDisplay = document.getElementById("browsing");
	mainDisplay.innerHTML = "";
	mainDisplay.appendChild(displayTheme.GetListDisplayComponent(elementListObject));
}

function downloadPopup(path, download_link){
	var window_div = document.createElement("div");
	window_div.className = "window shadow";
	window_div.id = "download_link_popup";
	var caption_div = Caption("Download " + path)
	//End of Caption defintion
	window_div.appendChild(caption_div);
	var content_div = document.createElement("div");
	content_div.className = "content";
	content_div.id = "download_link_content";
	var display_content_div = document.createElement("div");
	var url_div = document.createElement("div");
	url_div.className = "input-control text";
	var download_link_input = document.createElement("input");
	download_link_input.type = "text";
	var dlink = location.protocol + "//" + location.host + "/downloads/" + download_link;
	download_link_input.value = dlink;
	url_div.appendChild(download_link_input);
	url_div.appendChild(document.createTextNode('\u00A0'));
	var download_link_download_button = document.createElement("span");
	//download_link_download_button.type = "button";
	download_link_download_button.className = "icon icon-download";
	download_link_download_button.onclick = function(){
		window.open(dlink);
	}
	url_div.appendChild(download_link_download_button);
	display_content_div.appendChild(url_div);
	content_div.appendChild(display_content_div);
	window_div.appendChild(content_div);
	return window_div;
}

function Caption(text){
	var caption_div = document.createElement("div");
	caption_div.className = "caption";
	//Caption definition
	var caption_span = document.createElement("span");
	caption_span.className = "icon icon-windows";
	caption_div.appendChild(caption_span);
	var caption_title = document.createElement("div");
	caption_title.className = "title";
	caption_title.innerHTML = text;
	caption_div.appendChild(caption_title);
	var caption_close_button = document.createElement("a");
	caption_close_button.className = "button small";
	var i =document.createElement("i");
	i.className = "icon-remove";
	caption_close_button.appendChild(i);
	caption_div.appendChild(caption_close_button);
	caption_close_button.onclick = function(){
		caption_div.parentNode.parentNode.removeChild(caption_div.parentNode);
	}
	return caption_div;
}
