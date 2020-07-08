/* V.1.0
-------------------------------------------------------------------------------
Name:		BD_UpdateAssetSETUP.js  

Description:	Este Script atualiza o SETUPAsset aberto, da opcao de mudar o nome e pega a versao mais recente do setup TEMPLATE;

Usage:		Deve ser usado em arquivos com Setup de ASSET;

Author:		Leonardo Bazilio Bentolila

Created:	Abril, 2020;
            
Copyright:   leobazao_@Birdo
 
-------------------------------------------------------------------------------
*/
include("BD_RemoveUnusedPalettes.js");

var rootBirdo = "C:/_BirdoRemoto/_Harmony";//FIXME: Caminhos HOMEOFFICE

	if(about.isMacArch()){//muda os caminhos no caso de ser MacOs
	rootBirdo = "/Users/" + about.getUserName() + "/Library/_BirdoRemoto/_Harmony";
	}

function BD_UpdateAssetSETUP(){

	if(!checkSETUP()){
	return;
	}

var listaPLTs = BD_RemoveUnusedPalettes();

	var d = new setupUpdateInterface(listaPLTs);
	d.ui.show();

////////////////funcoes extras main///////////////////////////////////////
	function checkSETUP(){
	var setup = "Top/SETUP";
		if(node.getName("Top/SETUP")==""){
		MessageBox.information("Esta cena nao tem SETUP!")
		return false; 
		}
		if(node.numberOfInputPorts(setup) != 3){
		MessageBox.information("Este SETUP esta diferente do Normal!\nPossivel que este arquivo nao seja um AssetSETUP!");
		return false;
		}
	return true;
	}	
}

////////////////////////////////INTERFACE////////////////////////
function setupUpdateInterface(pltList){
this.ui = UiLoader.load(rootBirdo + "/UI/UpdateAssetSETUP.ui");

this.scenePath = scene.currentProjectPath();
this.scene = scene.currentScene();
this.originalPath = this.scenePath.slice(0, (this.scenePath.length - (this.scene.length+1)));
this.ui.groupBox.linePath.text =  fileMapper.toNativePath(this.originalPath);
this.ui.groupBox.comboBox.addItems(["CHAR", "PROP", "ILUSTRA"]);

this.projList = getProjs();
this.projeto = checkProj();

	if(!this.projList){
	this.ui.close();
	}

this.ui.comboProj.addItems(this.projList[0]);

	if(!this.projeto){
	this.ui.comboProj.enabled = true;
	} else {
	this.ind = this.projList[0].indexOf(this.projeto);
	this.ui.comboProj.setCurrentIndex(this.ind);
	}

/////CALL BACK FUNCTIONS////////////////////////
	this.enableGroup = function(){
	this.ui.groupBox.enabled = this.ui.radioRename.checked;
	}
	
	this.getPath = function(){
	this.folderPath = FileDialog.getExistingDirectory(this.originalPath, "Escolha Onde Salvar o Arquivo Novo");
	this.ui.groupBox.linePath.setText(this.folderPath);
	}

	this.updateSaida = function(){
	this.prefix = this.ui.groupBox.comboBox.currentText.slice(0, 2);
	this.number = ("000" + this.ui.groupBox.spinBox.text).slice(-3);
	this.nome = this.ui.groupBox.lineName.text;
	this.saida = this.prefix + this.number + "_" + this.nome;
	this.ui.groupBox.labelSaida.setText(this.saida.toUpperCase());
	}
	
	this.okOperation = function(){
	this.setupTPL = this.projList[1][this.ui.comboProj.currentIndex];
	this.msgFinal = "**UPDATE ASSET SETUP**\n\nRelatorio Final:\n";
		if(this.setupTPL == ""){
		MessageBox.information("Selecione um Projeto!");
		return;
		}
	
		if(this.ui.radioRename.checked){//Marcado para salvar como
		this.name = this.ui.groupBox.labelSaida.text;
			if(!checkName(this.name)){
			return;
			}
		this.fullPath = fileMapper.toNativePath(this.ui.groupBox.linePath.text + "/" + this.name);
		MessageLog.trace(this.fullPath);
			if(!dirExists(this.ui.groupBox.linePath.text)){
			MessageBox.information("A pasta selecionada nao existe! Selecione uma valida!\n" + this.ui.groupBox.linePath.text);
			return;
			}
			if(dirExists(this.fullPath)){
			MessageBox.information("Este arquivo de Toon Boom ja existe! Nao sera possivel sobrescrever!\nEscolha outro nome, ou caminho!\n" + this.fullPath);
			return;
			}

			deletePalletsFiles(pltList);

			if(scene.saveAs(this.fullPath)){//salva a cena no path selecionado
			this.msgFinal += "  - Arquivo Renomeado com sucesso;\n";
			} else {
			this.msgFinal += "  - Falha ao renomear o Arquivo;\n";
			}

			if(this.ui.groupBox.checkPalette.checked){//Marcado Para adiconar Paletta
			addNewPalette(this.name);
			this.msgFinal += "  - Palette nova adicionada;\n";
			}

			if(this.ui.groupBox.checkNodes.checked){//Marcado Para renomear nodes
			this.msgFinal += renameNodes(this.scene, this.name);
			}
		
		}

	this.msgFinal += updateSetup(this.setupTPL);

	scene.clearHistory();
	scene.saveAll();
	MessageBox.information(this.msgFinal + "\nVolte Sempre! :)");
	this.ui.close();
	}
	
	this.cancelOperation = function(){
	MessageLog.trace("Canceled!");
	this.ui.close();
	}

	this.ui.radioRename.toggled.connect(this,this.enableGroup);
	this.ui.radioSETUP.toggled.connect(this,this.enableGroup);

	this.ui.groupBox.comboBox["currentIndexChanged(int)"].connect(this,this.updateSaida);
	this.ui.groupBox.spinBox["valueChanged(int)"].connect(this,this.updateSaida);
	this.ui.groupBox.lineName.textEdited.connect(this,this.updateSaida);
	this.ui.groupBox.pathButton.clicked.connect(this,this.getPath);

	this.ui.cancelButton.clicked.connect(this,this.cancelOperation);
	this.ui.okButton.clicked.connect(this,this.okOperation);
	
	///////////////////////funcao extra//////////////////////////
	function deletePalletsFiles(pltFileList){//Deleta os arquivos de plt listados pelo RemoveUnusedPalettes
	for(var i=0; i<pltFileList.length; i++){
	var file = new File(pltFileList[i]);
		if(file.exists){
		file.remove();
		MessageLog.trace("O arquivo: " + pltFileList[i] + " foi removido!");
		}
	}
	}
	
	function addNewPalette(newPaletteName){//adiciona nova paletta
	var curPaletteList = PaletteObjectManager.getScenePaletteList();
	var newPalettePath = curPaletteList.getPath() + "/palette-library/" + newPaletteName;
	return curPaletteList.createPalette(newPalettePath);
	}

	function dirExists(dirP){//checa se o diretorio existe
	var myDir = new Dir;
	myDir.path = dirP;
	return myDir.exists;
	}
	function checkProj(){//checa se o Stup atual contem o node proj com info sobre projeto
	var proj = "Top/SETUP/proj";
		if(node.getName(proj) != ""){
		return node.getTextAttr(proj, 1,"TEXT");
		} else {
		return false;
		}
	}
	function checkName(assetName){//checa se o nome escolhido está no padrao
	var last = assetName[assetName.length-1];
	var proibido = ["!", "@", "#", "%", "¨", "&", "*", "+","`", "´", ".", "~", "^" , "-"];
		if(assetName.length < 7){
		MessageBox.information("Escolha um Nome!");
		return false;
		}
		for(var i=0;i<proibido.length;i++){
			if(assetName.indexOf(proibido[i]) != -1){
			MessageBox.information("Nome Inválido! Caractere '" + proibido[i] + "' não permitido!");
			return false;
			}
		}
		if(last == "_"){
		MessageBox.information("Nome Inválido! Não use '_' no fim do nome!");
		return false;
		}
	return true;
	}

	function getProjs(){//retorna [0] lista com siglas de projetos - [1] lista com paths pros tpls
	var projList = [""];
	var pathsList = [""];
	var finalList = [];
	var myDir = new Dir();
	myDir.path = rootBirdo + "/templates/AssetSETUP";
	var fileList = myDir.entryList("*",1,4);
		if(fileList == ""){
		MessageBox.information("Nao foi possivel achar os templates! Avise o Leo!");
		return false;
		}
		
		for(var i=0;i<fileList.length;i++){
			if(fileList[i].indexOf("SETUPupdate") != -1){
			projList.push(fileList[i].split("_")[0]);
			pathsList.push(myDir.path + "/" + fileList[i]);
			}
		}
	finalList.push(projList);
	finalList.push(pathsList);
	return finalList;
	}
	
	function updateSetup(pathTpl){//faz o update do SETUP com o tpl do grupo do setup como parametro
	var setup = "Top/SETUP";
	var coordX = node.coordX(setup);
	var coordY = node.coordY(setup);
	var nodesList = [];
	var conections = node.numberOfInputPorts(setup);
		for(var i=0; i<conections; i++){
		var n1 = node.srcNode(setup, i);
		nodesList.push(n1);
		}
	node.deleteNode(setup, true, true);
	scene.saveAll();

	copyPaste.setPasteSpecialCreateNewColumn(true);
	copyPaste.usePasteSpecial(true);
	copyPaste.setExtendScene(false);
	copyPaste.pasteTemplateIntoScene(pathTpl,"",1);
		for(var y=0; y<nodesList.length; y++){
		node.link(nodesList[y], 0, setup, y);
		}
	node.setCoord(setup, coordX, coordY);
	var exportNode = "Top/SETUP/EXPORT";
	node.setTextAttr(exportNode, "DRAWING_NAME", 0, scene.currentProjectPath());
	node.setAsDefaultCamera("Camera");
	node.setAsGlobalDisplay("Top/SETUP/ASSET_VIEW");
	selection.clearSelection();
	return "  - Setup Atualizado com sucesso!;\n";
	}



	function renameNodes(oldName, newName){//REnomeia todos nodes da cena para o nome novo
	var setup = "Top/SETUP";
	var topList = getAllNodes(node.root());
	counter = 0;
		for(var i=0; i<topList.length; i++){
			if(renameNode(topList[i])){
			counter++;
			}
		}
	var msgRename = "  - Nodes Renomeados: " + counter + ";\n";
	return msgRename;
		function getAllNodes(nodGroup){//Lista todos sub nodes do grupo
		var listToFill = [];
		var groupList = [];
		listaRecursivamente(node.subNodes(nodGroup));	
			function listaRecursivamente(sub){
			for(var y = 0;y<sub.length;y=y+1){
				if(node.type(sub[y]) != "GROUP"){
				listToFill.push(sub[y]);
				} else {
				groupList.push(sub[y]);
				listaRecursivamente(node.subNodes(sub[y]));
				}
			}
			}
		return listToFill.concat(groupList);
		}
		function renameNode(nod){
		var nodeName = node.getName(nod);
			if(nodeName.indexOf(oldName) == -1){
			return false;
			}
		var newNodeName = nodeName.replace(oldName, newName);
		var columnId = node.linkedColumn(nod,"DRAWING.ELEMENT");
		var elementKey = column.getElementIdOfDrawing(columnId);

			if(node.rename(nod, newNodeName)){
			column.rename(columnId, newNodeName);
			element.renameById(elementKey, newNodeName);
			return true;
			}
		}
	}

}