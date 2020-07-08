/*v1.0
-------------------------------------------------------------------------------
Name:		BD_BirdoImportASSETs.js

Description:	Este script e uma interface usual para importar ASSETs para a cena

Usage:		Escolha os assets disponiveis para o projeto da cena aberta, e importe para nodeview

Author:		Leonardo Bazilio Bentolila

Created:	Maio, 2020.
            
Copyright:  leobazao_@Birdo
-------------------------------------------------------------------------------
*/
include("BD_ProgressBarDupla.js");

var rootRede = null;
var birdoRemoto = null;
//define os caminhos necessarios local e rede de cada OS
	if(about.isMacArch()){//define caminhos no Mac
	rootRede = "/Volumes";
	birdoRemoto = "/Users/" + about.getUserName() + "/Library/_BirdoRemoto/";
	} else if(about.isWindowsArch()){//define caminhos no Windows
	rootRede = "//192.168.10.101";
	birdoRemoto = "C:/_BirdoRemoto/";
	} else {
	MessageBox.information("Sistema Operacional Nao suportado pra esse Script!\nSorry!!");
	return;
	}


function BD_BirdoImportASSETs(){
	if(!checkVPN()){
	return;
	}

var proj = getProjFile();//projeto do ARQUIVO

	if(!proj){
	MessageBox.information("Nao foi possviel encontrar o projeto que o arquivo pertence! Avise o Leo!");
	return;
	}

var paths = getPaths(proj);

	if(!paths){
	return;
	}

var tiposList = ["CHAR", "PROP", "FX", "ILUSTRA"];//ADICIONAR TIPO DE ASSET AQUI (tem que existir a pasta com mesmo nome em tplLIst);
var libraryPath = rootRede + paths[3] + "LibraryTPLs";

var pg = new BD_ProgressBarDupla("Listando ASSETs", "Acessando a LibraryTPL...");//Importa UI progressBar

pg.ui.show();
pg.ui.groupBox.progressBar1.setRange(0, tiposList.length);//range progressBar em 6 partes principais
var listaAssets = [];

	for(var i=0; i<tiposList.length; i++){
	pg.ui.groupBox.label1.setText("listando..." + tiposList[i]);
	pg.ui.groupBox.progressBar1.setValue(i);
	listaAssets.push(getTplList(libraryPath, tiposList[i]));
	}
	
pg.ui.close();

printLista(listaAssets);

	var d = new importAssetInterface(tiposList, listaAssets);
	d.ui.show();

////////////////////////////////////////////FUNCOES EXTRAS MAIN////////////////////////////////////////////
	function checkVPN(){//checa conexao com o servidor da birdo!
	var rede = rootRede;
	var progressDlg;
	progressDlg = new QProgressDialog();
	progressDlg.open();
	progressDlg.setLabelText("Testando Conexao VPN");
	progressDlg.setRange(5, 1);
	var myDir = new Dir;
	myDir.path = rede;
	progressDlg.hide();
		if(!myDir.exists){	
		MessageBox.information("Nao foi possivel conectar o Servidor da Birdo " + rede + "\nTente reconectar o VPN, se nao conseguir, avise a TI!!!");
		return false;
		}
	return true;
	}

	function getPaths(projeto){/*Funcao para pegar os caminhos na rede segundo index [0] Windows [1] mac
	[0]: Titulo do Projeto;
	[1]: SubTitulo do Projeto;
	[2]: caminho da ANIMACAO na rede EP/1_Cenas ... EP/2_Render;
	[3]: caminho da pasta _tbLIB (BirdoLib, tplLib, _NOTES);
	[4]: caminho dos BGs prontos para importar;
	[5]: caminho para a pasta DESIGN;
	[6]: caminho BOARD na rede (0_Thumbnail, 1_Projetos, 2_Render_WIP, 3_Render_Aprovacao);
	[7]: caminho para BIBLIOTECA;
	[8]: caminho da cena para usar na _renderFazendinha (adicionar ep + "1_Cenas")*/
	var filepath = birdoRemoto + "_Harmony/_local/Path_Library/" + projeto + ".txt";
	var pathList = [];
	var file = new File(filepath);
		if(file.exists){
		file.open(FileAccess.ReadOnly);
		var linhas = file.readLines();
			for(var i=0; i<linhas.length; i++){
			var path = linhas[i].substring(0,(linhas[i].length - 1));
				if(path == ""){
				break;
				}
			pathList.push(path);
			}
		file.close;
		} else {
		MessageBox.information("Este projeto ainda não foi documentado na Path_Library! Avise a Supervisão!");
		return false;
		}
	return pathList;
	}

	function getProjFile(){//Funcao q retorna qual projeto o arquivo se refere para comparar como proj do rig
	var projeto = scene.currentScene().split("_")[0];
		if(projeto.length == 3){
		return projeto;
		} else {
		var infoProj = "Top/SETUP/proj";
			if(node.getName(infoProj) == ""){
			MessageLog.trace("Nao Foi possivel encontrar o PROJETO do arquivo!");
			return false;
			}	
		projeto = node.getTextAttr(infoProj, 1,"TEXT");
		} 
	return projeto;
	}

	function getTplList(libPath, tipoAsset){//retorna lista em cada item = [0] full path do tpl; [1] nome tpl; [2] tag list do tpl [3] thumblist
	var fullPathList = [];
	var nameList = [];
	var tags = [];
	var finalList = [];
	var assetTypePath = libPath + "/" + tipoAsset;
	var dir = new Dir;
	dir.path = assetTypePath;
	var folderList = dir.entryList("*", 1, 4);
	pg.ui.groupBox.progressBar2.setRange(0, folderList.length);
		for(var i=2; i<folderList.length; i++){
		pg.ui.groupBox.label2.setText("analizando folder..." + folderList[i]);
		pg.ui.groupBox.progressBar2.setValue(i);
			if(isTPL(folderList[i])){
			fullPathList.push(dir.filePath(folderList[i]));
			nameList.push(folderList[i]);	
			tags.push(getTags(dir.filePath(folderList[i])));
			}
		}
	pg.ui.groupBox.progressBar2.reset();

	finalList.push(fullPathList);
	finalList.push(nameList);
	finalList.push(tags);
	return finalList;
		function isTPL(folder){//checa se o folser e um .tpl
		return folder.slice(-4) == ".tpl";
		}
		function getTags(tplPath){//pega a lista de tags do tpl
		var file = new File(tplPath + "/_LibraryTAGS.txt");
			if(!file.exists){
			return "NULL";
			}
		file.open(FileAccess.ReadOnly);
		var linhas = file.readLines();
		file.close();
		return linhas;
		}
	}

	function printLista(listaTeste){//Printa info sobre lista de tpl gerada
	MessageLog.trace("IMPORT ASSET - Listas de TPLs:");
		for(var i=0; i<listaTeste.length; i++){
		MessageLog.trace("======================");
		MessageLog.trace("Tipo: " + tiposList[i]);
		MessageLog.trace("Caminho TPL: " + listaTeste[i][0].length + " itens!");
		MessageLog.trace("Nome TPL: " + listaTeste[i][1].length + " itens!");
		MessageLog.trace("Tags TPL: " + listaTeste[i][2].length + " itens!");
		MessageLog.trace("======================");
		}
	}

}


function importAssetInterface(assTypeList, tplLIST){//Interface : parametro 1) lista de tipos 2) lista de caminhos, nomes e tags de cada tipo
this.ui = UiLoader.load(birdoRemoto + "_Harmony/UI/BirdoImportASSETs.ui"); ///FIXME UI PATH

//## ADICIONA LOGO #####//
this.pix = new QPixmap;
this.pix.load(birdoRemoto + "_Harmony/image/logo_njn.jpg");
this.ui.logoProj.pixmap = this.pix;
this.ui.logoProj.text = null;

this.selectedTemplate = -1;
this.importList = 0;
this.thumbItem = [null];

	//CRIA A LISTA DE TIPO//
	this.typeList = new QStringListModel;
	this.typeList.setStringList(assTypeList);
	this.ui.listView.setModel(this.typeList);

	//##CALL BACK FUNCTIONS##//
	this.createTreeItems = function(){
	this.ui.listWidget.clear();
	this.assetType = assTypeList[this.ui.listView.currentIndex().row()];
	this.currTplList = tplLIST[this.ui.listView.currentIndex().row()];
		for(var i=0; i<this.currTplList[1].length; i++){
		this.treeItem = new QListWidgetItem(this.ui.listWidget);
		this.treeItem.setText(this.currTplList[1][i]);
		this.treeItem.setCheckState(!Qt.Checked);
		}
	}
	
	this.updateItem = function(){
	this.selectedTemplate =  this.ui.listWidget.currentIndex().row();
	this.thumbItem = getThumbNails(tplLIST[this.ui.listView.currentIndex().row()][0][this.selectedTemplate]);
		if(this.thumbItem[0] == null){
		this.ui.groupPreview.thumb.text = "No Thumbnails!";
		return;
		}
	this.ui.groupPreview.thumb.pixmap = this.thumbItem[0];
	this.ui.groupPreview.thumb.text = null;
	this.ui.groupPreview.slider.value = 0;
	this.ui.groupPreview.slider.maximum = this.thumbItem.length - 1;
	}

	this.updateSlider = function(){
	this.currThumb = this.thumbItem[this.ui.groupPreview.slider.value];
		if(this.ui.groupPreview.thumb.pixmap != null){
		this.ui.groupPreview.thumb.pixmap = this.currThumb;
		this.ui.groupPreview.thumb.text = null;
		}
	}

	this.importTemplate = function(){
	this.importList = [];
	this.tipo = tplLIST[this.ui.listView.currentIndex().row()];
		for(var i=0; i<this.tipo[0].length; i++){
		var item = this.ui.listWidget.item(i);
    			if(item.checkState() == Qt.Checked){
			this.importList.push(this.tipo[0][i]);
			}
		}
		if(this.importList.length ==0){
		MessageBox.warning("Selecione pelo menos um ASSET para importar!", 3,0);
		return;
		}
	this.ui.close();
	importAssetList(this.importList);
	return;
	}

	this.clickCancel = function(){
	MessageLog.trace("Canceled!");
	this.ui.close();
	}

//////////////////////FIM CALL BACK FUNCTIONS
	this.ui.listWidget["currentRowChanged(int)"].connect(this,this.updateItem);
	this.ui.listView.clicked.connect(this, this.createTreeItems);
	this.ui.importButton.clicked.connect(this, this.importTemplate);
	this.ui.buttonCancel.clicked.connect(this, this.clickCancel);
	this.ui.groupPreview.slider.valueChanged.connect(this,this.updateSlider);

///////////////FUNCOES EXTRAS///////////////////////////////////////////////////
	function getThumbNails(tplPath){//cria lista de pixmap 
	var pixmapList = [];
	var myDir = new Dir;
	myDir.path = tplPath + "/.thumbnails";
		if(!myDir.exists){
		pixmapList[0] = null;
		return pixmapList;
		}
	var thumbsLists = myDir.entryList("*.png",2,4);
	var progressDlg;
	progressDlg = new QProgressDialog();
	progressDlg.open();
	progressDlg.setRange(0, thumbsLists.length);
		for(var i=0;i<thumbsLists.length;i++){
		progressDlg.setLabelText("generating ThumbNails...\n" + thumbsLists[i]);
		progressDlg.setValue(i +1);
			if(myDir.fileExists(thumbsLists[i])){
			pixmapList[i] = new QPixmap;
			pixmapList[i].load(myDir.filePath(thumbsLists[i]));
			}
		}
	progressDlg.hide();
	return pixmapList;
	}
	
	function importAssetList(assetImports){//Importa a lista de templates pra cena
	var msg = "Relatorio ASSET Import:\n\n";
	var progressDlg;
	progressDlg = new QProgressDialog();
	progressDlg.open();
	progressDlg.setRange(0, assetImports.length);

	copyPaste.setPasteSpecialCreateNewColumn(true);
	copyPaste.usePasteSpecial(true);
	copyPaste.setExtendScene(false);
	copyPaste.setPasteSpecialColorPaletteOption("COPY_PALETTE_AND_UPDATE_COLOURS");

		for(var i=0; i<assetImports.length; i++){
		progressDlg.setLabelText("Importando templates...\n" + assetImports[i]);
		progressDlg.setValue(i +1);
		var tpl = copyPaste.pasteTemplateIntoScene(assetImports[i], "", 1);
			if(!tpl){
			var arr = assetImports[i].split("/");
			MessageLog.trace("Fail to import " + arr[arr.length-1]);
			msg += " -" + arr[arr.length-1] + " - fail;\n";
			} else {
			var arr = assetImports[i].split("/");
			MessageLog.trace("Asset Importado com sucesso!" + arr[arr.length-1]);	
			msg += " -" + arr[arr.length-1] + " - OK;\n";
			}
		}
	msg += "\nFim do Import!";
	progressDlg.hide();
	MessageBox.information(msg);
	}
}

