
var currentPage
var simplemde
var list
var sortedList
var name
var desc

var idToSave = ""// window.location.pathname.substr(window.location.pathname.lastIndexOf('/') + 1 )


$( document ).ready(function() {

    simplemde= new SimpleMDE({
        element: document.getElementById("demo1"),
        spellChecker: true,
      toolbar: ["bold", "italic", "|", "heading-1", "heading-2", "heading-3", "|", "code","quote","|","unordered-list","ordered-list","|","link","image","table","side-by-side","fullscreen"],
      status: false,
      renderingConfig: {
        singleLineBreaks: false,
        codeSyntaxHighlighting: true,
      }
    });
    //simplemde.toggleSideBySide()
    //simplemde.toggleSideBySide()


	// need to set au-body class on preview
    // hook the button somehow
    //setTimeout(function() { document.getElementsByClassName("editor-preview-side editor-preview-active-side")[0].classList.add("au-body"); }, 100);

    list = document.getElementById("pages")
    sortedList = Sortable.create(list, {
        animation: 10,
            filter: '.js-remove',
            onFilter: function (evt) {
                evt.item.parentNode.removeChild(evt.item);
          selectFirstPage()
        }
      }
    )

/*
    $.getJSON( "https://api.gov.au/repository/service/" + id, function( data ) {
      $.each( data.pages, function( pageNum ) {
        addPage("Title", data.pages[pageNum])
      });

      name = data.name
      desc = data.description

      selectFirstPage()
    });
*/


    simplemde.codemirror.on("change", function() {
      var content = simplemde.value()
      currentPage.data("content", content)
      currentPage.html(getPageNav(content))
    });


/*
    setTimeout(function() {
        // disable's pressing esc to exit full screen
        simplemde.__proto__.toggleFullScreen = function(){}
        simplemde.codemirror.options["fullScreen"]=false

        // hide buttons
        simplemde.toolbarElements.fullscreen.style.display = "none"
        simplemde.toolbarElements["side-by-side"].style.display = "none"
    }, 100);
*/
});




function getHText(line){
  if(!line.indexOf("#") == 0) return ""
  return line.replace(new RegExp('[#]', 'g'), "").trim();
}

function whatHlevel(line){
  return (line.split("#").length - 1);
}

function getPageTitle(content){
  var lines = content.match(/[^\n]+/g);
  if(lines == null || lines.length < 1) return "<h3>Untitled page</h3>";


  var nav = ""
  var title = ""
  var foundH1 = false

  for (var i = 0; i < lines.length; i++) {

    var line = lines[i];
    if(whatHlevel(line) == 1 && !foundH1){
      foundH1 = true
      title = getHText(line)
      if(title.trim() == "") title = "Untitled page"
    }

    if(whatHlevel(line) == 2){
      var head = getHText(line)
      if(title.trim() != ""){
        nav = nav + "<li>" + head + "</li>"
      }
    }
  }

  if(!foundH1) title = "Untitled page"
  return "<h3>" + title + "</h3><ul class='nav'>" + nav + "</ul>"
}



function getPageNav(content){
  return "<div class='nav_wrapper'>" + getPageTitle(content) + '</div><p class="js-remove">✖</p>'
}

function addPage(title, content){
  var li = $('<li>')
  li.data("content", content)
  li.html(getPageNav(content))
  li.click(function() {
    if(typeof(currentPage) != "undefined") currentPage.removeClass("current-page")
    currentPage = li
    currentPage.addClass("current-page")
    simplemde.value(li.data("content"))
  })
  $("#pages").append(li);
}


function newPage(){
    addPage("New page", "# New page")
}


function save(){

    var auth = btoa($( "#apikey_input" ).val())

    var save = {name:name, description:desc, pages:[]}

    var lis = $("#pages > li ")
    lis.each(function(item){

     var data = $(lis[item]).data("content")
     save.pages.push(data)

   })


   console.log(JSON.stringify(save))

   $.ajax
    ({
      type: "post",
      url: "https://api.gov.au/repository/service/" + idToSave,
      dataType: 'json',
      async: false,
      headers: {
        "Authorization": "Basic " + auth,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(save),
      success: function (){
        alert('Thanks for your comment!');
      },
      error: function(){
        alert("something went wrong")
      }
    });

}

function selectFirstPage(){
  $($("#pages li")[0]).click()
}



function showAPIs(){
    var auth = btoa($( "#apikey_input" ).val())
	$('#api_list').show()
	$('#editor_view').hide()
	var view = $('#api_list')
    view.empty()
    view.append("<hr/>")
	view.append("<ul>")
    //$.getJSON( "https://api.gov.au/repository/index", function( data ) {
    $.ajax("https://api.gov.au/repository/indexWritable", {crossDomain:true, 
      headers: {
        "Authorization": "Basic " + auth,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      success: function(data) {
      $.each( data.content, function( i ) {
        view.append(`<li><a href="#" onclick="edit('${data.content[i].id}')">${data.content[i].name}</a></li>`)
      });
	}});
	view.append("</ul>")

	window.scrollTo(0,document.body.scrollHeight);
}

function load(id){

  	$("#pages").empty();
    $.getJSON( "https://api.gov.au/repository/service/" + id, function( data ) {
      $.each( data.pages, function( pageNum ) {
        addPage("Title", data.pages[pageNum])
      });

      name = data.name
      desc = data.description

      selectFirstPage()
    });

}

function edit(id){
	$('#api_list').hide()
	load(id)
	$('#editor_view').show()
	console.log("editing:" + id);
	idToSave = id
}
