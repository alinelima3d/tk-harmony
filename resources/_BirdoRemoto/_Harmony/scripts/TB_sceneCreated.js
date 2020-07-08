//v5 - for Anim
/*
  Function: TB_sceneCreated
  Description: function executes when creating a new scene.
 */ 
function TB_sceneCreated(){
var rootBirdo = "C:/_BirdoRemoto/_Harmony";//FIXME: Caminhos HOMEOFFICE

	if(about.isMacArch()){//muda os caminhos no caso de ser MacOs
	rootBirdo = "/Users/" + about.getUserName() + "/Library/_BirdoRemoto/_Harmony";
	}

scene.beginUndoRedoAccum("New Scene: Create")
frame.insert(0, 10);

var d = new assetDIALOG(rootBirdo);
d.ui.show();

scene.endUndoRedoAccum();
//  Clear the command history
scene.clearHistory();

}

function assetDIALOG(root){

this.ui = UiLoader.load(root + "/UI/create_AssetSETUP.ui");

//### CRIA COMBO LIST ####//
this.ui.groupProjeto.comboPROJ.addItems(["Escolha Projeto", "BADABEAN", "NINJIN"]);
	
	//##### C A L L   B A C K   F U N C T I O N S #####//
	this.changecomboPROJ = function(){
	this.ui.groupProjeto.labelSIGLA.setText(this.getProj());
	}
	
	this.getProj = function(){
	this.proj = "PROJ";
		if(this.ui.groupProjeto.comboPROJ.currentText == "BADABEAN"){
		this.proj = "bdb";
		}
		if(this.ui.groupProjeto.comboPROJ.currentText == "NINJIN"){
		this.proj = "njn";
		}
	return this.proj;
	}

	this.clickCREATE = function(){
		if(this.ui.groupProjeto.comboPROJ.currentIndex == 0){
		MessageBox.information("Escolha um Projeto!");
		return;
		}
	this.assetTPL = root + "/templates/AssetSETUP/asset_" + this.getProj() + ".tpl";
	importASSETtpl(this.assetTPL);
	changeSetup();
	scene.saveAll();
	MessageLog.trace("Asset SETUP criado com sucesso!!!");
	this.ui.close();
	}

//########### fim das CALL BACK FUNCTIONS ###########//
this.ui.groupProjeto.comboPROJ["currentIndexChanged(int)"].connect(this,this.changecomboPROJ);
this.ui.createButton.clicked.connect(this,this.clickCREATE);

	///////////////funcoes extras//////////////////////
	function importASSETtpl(tplPATH){
	copyPaste.setPasteSpecialCreateNewColumn(true);
	copyPaste.usePasteSpecial(true);
	copyPaste.setExtendScene(false);
	copyPaste.pasteTemplateIntoScene(tplPATH,"",1);
	node.setAsGlobalDisplay("Top/SETUP/ASSET_VIEW");
	node.setAsDefaultCamera("Camera");
	selection.clearSelection();
	selection.addNodeToSelection("Top/Asset");
	}
	
	function changeSetup(){
	var assetName = scene.currentScene();
	var scenePath = scene.currentProjectPath();
	var assetNode = "Top/Asset";
	var columnId = node.linkedColumn(assetNode,"DRAWING.ELEMENT");
	var elementKey = column.getElementIdOfDrawing(columnId);
	node.rename(assetNode, assetName);
	column.rename(columnId, assetName);
	element.renameById(elementKey, assetName);
	var exportNode = "Top/SETUP/EXPORT";
	node.setTextAttr(exportNode, "DRAWING_NAME", 0, scenePath);
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
	}
}
