/*
  Function: TB_sceneOpenPreUI_Offline
  Description: function executes when opening an existing offline scene before the UI (views, layouts) have
               been created and loaded.
  Note: This script is also executed when opening a template for editing.
 */ 
include( "TB_RelinkPaths.js" )

function TB_sceneOpenPreUI_Offline(){
TB_RelinkPathsInteractive();

var assetName = scene.currentScene();
var scenePath = scene.currentProjectPath();
var textLog = scenePath + "/_scene.log";

	if(!writeLog(textLog)){
	MessageLog.trace("Scene Opened! " + scenePath);
	return;
	}

	var assetNode = "Top/bdb_startup";
	var columnId = node.linkedColumn(assetNode,"DRAWING.ELEMENT");
	var elementKey = column.getElementIdOfDrawing(columnId);
	node.rename(assetNode, assetName);
	column.rename(columnId, assetName);
	element.renameById(elementKey, assetName);
	var exportNode = "Top/SETUP/EXPORT";
	var exportPath = "frames/" + assetName;
	node.setTextAttr(exportNode, "DRAWING_NAME", 0, exportPath);
	var paletPath = scenePath + "/palette-library/" + assetName;
	var paletteList = PaletteObjectManager.getScenePaletteList();
	var paleta = paletteList.addPalette(paletPath);
	var numCor = paleta.nColors;
		for(var i=numCor-1; i>0; i--){
		var cor = paleta.getColorByIndex(i);
			if(cor.name != "Black"){
			paleta.removeColor(cor.id);
			}
		}
	
	scene.saveAll();
	scene.clearHistory();

	file.saveAs("C:/Temp/")
	
	function writeLog(txtName){//cria um log com as infos sobre o envio
	var file = new File(txtName);
		if(!file.exists){
		file.open(FileAccess.WriteOnly);
		file.writeLine("---------------------------Scene Created---------------------------------" + "\r");
		file.writeLine("user: " + about.getUserName() + "\r");	
		file.writeLine("time created: " + new Date() + "\r");
		file.close();
		MessageLog.trace("O arquivo '" + txtName + "' foi criado com sucesso!" );
		return true;
		} else { 
		return false;
		}
	}
	
}

function TB_sceneOpenPreUI_Online(){
}


	