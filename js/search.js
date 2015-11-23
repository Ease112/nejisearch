$(function(){
	$("#button").click(function(){
		submit(0);
	});
	
	$("#key").keypress(function(e){
		if(e.which == 13) {
			submit(0);
			return false;
		}
	});
	
	$(document).on("click", "#next",function(e){
		e.stopPropagation();
		var os = Number($("#page").text());
		os *= 20;
		submit(os);
	});
	
	$(document).on("click", "#prev",function(e){
		e.stopPropagation();
		var os = Number($("#page").text()) -2;
		os *= 20;
		submit(os);
	});
	
	function submit(offset){
		$("#result").html("<p>検索中...</p>");
		var property = "";
		var select = $("#select").val();
		
		if(select=="label")
			property = "rdfs:label";
		else if(select=="code")
			property = "nejiterms:productCode";
		else if(select=="screenNotationName")
			property = "nejiterms:screenNotationName";
		else if(select=="formNotationName")
			property = "nejiterms:formNotationName";
			
		var key = $("#key").val();
		var sparql = generateSPARQL(key, property, offset);
		var format = "&format=application%2Fjson&timeout=0&debug=on";
		var query = sparql + format;
		var business = $("#business:checked").val();
		
		if(key!="") {
			$.getJSON("http://monodzukurilod.org/sparql?default-graph-uri=http%3A%2F%2Fmonodzukurilod.org%2Fneji&query=" + query, function(json){
				var bindings = json.results.bindings;
				var result = "";
				var s = "";		//商品URI
				var o = "";		//
				var code = "";
				var b = "";
				var label = "";
				var company = "";
				if(bindings=="") {
					result = "<p>Not found</p>";
				} else {
					if(business == "checked") {
						result = "<table><tr><th>分類コード</th><th>名称</th><th>提供企業</th></tr>";
					} else {
						result = "<table><tr><th>分類コード</th><th>名称</th></tr>";
					}
					
					for(var i=0; i<bindings.length; i++) {
						s = bindings[i].s.value;
						o = bindings[i].o.value;
						code = bindings[i].code.value;
						if(bindings[i].b != null) {
							b = bindings[i].b.value;
							label = bindings[i].label.value;
							company = "<a href=\"" + b + "\">" + decodeURI(label) + "</a>";
						} else {
							b = "";
							label = "";
							company = "";
						}
						result += "<tr><td><a href=\"" + s + "\">" + decodeURI(code) + "</a></td><td>" + o + "</td>";
						if(business == "checked") {
							result += "<td>" + company + "</td>";
						}
						result += "</tr>";
					}
					result += "</table>";
				}
				
				$("#result").html(result);
				if(offset==0)
					$(".np").html("<span id='page'>" + (offset + 20)/20 + "</span>ページ目　　　" + "<a id='next' href='javascript:void(0);'>次の20件</a>");
				else
					$(".np").html("<span id='page'>" + (offset + 20)/20 + "</span>ページ目　　　" + "<a id='prev' href='javascript:void(0);'>前の20件</a> | <a id='next' href='javascript:void(0);'>次の20件</a>");
				
			});
		} else {
			$("#result").html("<p id='error'>キーワードを入力してください。</p>");
		}
		return false;
	}
	
	function generateSPARQL(key, property,offset) {
		key = key.replace(/　/g, " ");
		var keylist = key.split(" ");
		var business = $("#business:checked").val();
		
		var sparql = "select distinct * where{" +
						"?s " + property + " ?o ; nejiterms:classificationCode ?code ";
		
		for(var i=0; i<keylist.length; i++) {
			sparql += "filter regex(str(?o), \"" + keylist[i] + "\") ";
		}
		
		if(business == "checked") {
			sparql += "optional { ?b gr:offers ?s ; rdfs:label ?label . }";
		}
		sparql += "} order by strlen(?o) offset " + offset + " limit 20";
		
		sparql = encodeURIComponent(sparql);
		/*
		sparql = sparql.replace(/ /g, "+");
		sparql = sparql.replace(/:/g, "%3A");
		sparql = sparql.replace(/\?/g, "%3F");
		sparql = sparql.replace(/,/g, "%2C");
		*/
		
		return sparql;
	}
});
