"use strict";
/*V2.0
//Update v2.0: melhorei a forma de checar se o nome da cena ta certo e acertei uma "/" no caminho
//FAZER: fazer checar se o RIG ta aprovado pelo SCRIPT supervisor RIG pra V2.0
-------------------------------------------------------------------------------
Name:		BD_GerarTPL.js

Description:	Este script e usado pela assistencia de direcao e pelo setor de RIG para gerar TPL do asset selecionado para LibraryTPL;

Usage:		Selecione o Asset pela NodeView, ter certeza q selecionou tudo certo. Procura o caminho pelo nome;

Author:		Leonardo Bazilio Bentolila

Created:	Abril, Marco, 2020.
            
Copyright:   leobazao_@Birdo
 
-------------------------------------------------------------------------------
*/
include("BD_RemoveUnusedPalettes.js");
include("BD_CheckNODESPalette_BAT.js");

var rootBirdo = "C:/_BirdoRemoto/_Harmony";//FIXME: Caminhos HOMEOFFICE

	if(about.isMacArch()){//muda os caminhos no caso de ser MacOs
	rootBirdo = "/Users/" + about.getUserName() + "/Library/_BirdoRemoto/_Harmony";
	}

function BD_GerarTPL(){

	if(!checkVPN()){
	MessageLog.trace("Falha ao Conectar o Servidor da birdo!");
	return;
	}

var proj = checkProj();
	if(!proj){
	return;
	}

var selNodes = checkSelecao();
	if(!selNodes){
	return;
	}

	if(!checkASSET(selNodes[0], selNodes[1])){
	MessageLog.trace("Cancelado! Asset nao esta pronto para enviar!");
	return;
	}

var assNome = checkScene();
	if(!assNome){
	MessageLog.trace("Gerar TPL cancelado!!!");
	return;
	} 

BD_RemoveUnusedPalettes();

var nodeList = listaNodes();

var listaPaletaUsadas = BD_CheckNODESPalette_BAT(nodeList);

	if(!checkPallets(listaPaletaUsadas)){
	return;
	}

	var d = new exportAprovDialog(assNome, proj, selNodes);
	d.ui.show();

//////////////////////////////FUNCOES EXTRAS MAIN//////////////////////////////////////
	function checkVPN(){//checa conexao com o servidor da birdo!
	var rede = "//192.168.10.101";
	var progressDlg;
	progressDlg = new QProgressDialog();
	progressDlg.open();
	progressDlg.setLabelText("Testando Conexao VPN");
	progressDlg.setRange(5, 1);
	var dir = new Dir;
	dir.path = rede;
	var conexao = dir.exists;
	progressDlg.hide();
		if(!conexao){
		MessageBox.information("Nao foi possivel conectar o Servidor da Birdo " + rede + "\nTente reconectar o VPN, se nao conseguir, avise a TI!!!");
		return false;
		}
	return true;
	}


	function checkScene(){//checa se e um ASSET setup e retorna nome do arquivo se tiver no padrao (sem versao)
	var sc = scene.currentScene();
	var ver = getVersionName(sc);
		if(!checkPrefix(sc.split("_")[0])){
		MessageBox.information("Nome de cena Inválido! O prefixo tem q ter o padrao : 'PR000'!");
		return false;
		}
		if(ver != ""){
		sc = sc.replace(ver, "");
		}
		if(node.getName("Top/SETUP") == ""){
		MessageBox.information("Este arquivo nao e um arquivo de ASSET!\nEste Scritp foi desenvolvido para funcionar em um Asset SETUP! Fale com o Leo!");
		return false;
		}
	var tipoList = ["CH", "FX", "IL", "PR"];
		if(tipoList.indexOf(sc.slice(0,2)) != -1){
		return sc;
		}
	return false;
		function checkPrefix(prefix){//checa se o prefixo esta certo incluindo o numero
			if(prefix.length != 5){
			return false;
			}
		var num = prefix.slice(2, 5);
		return !isNaN(num);
		}
	}

	function checkProj(){//checa se o Stup atual contem o node proj com info sobre projeto
	var proj = "Top/SETUP/proj";
		if(node.getName(proj) != ""){
		return node.getTextAttr(proj, 1,"TEXT");
		} else {
		MessageBox.information("Este SETUP ASSET esta desatualizado! Use o Script 'BD_UpdateSETUPAsset'!\nEscolha opcao para somente atualizar, escolha o nome do Projeto, e tente de novo!");
		return false;
		}
	}

	function checkSelecao(){//Checa se a selecao esta correta, retorna [0] nodeAsset [1] nodePEG;
	var nodesSel = [];
		if(selection.numberOfNodesSelected() != 2){
		MessageBox.information("Selecione apenas o ASSET e sua PEG!\nSe For RIG, lembre de selecionar o BackDrop!\n-Se somente existe o Node Drawing do asset sem PEG,\ncrie uma PEG!\n-Se ele Esta desenhado em mais de um Node e nao esta agrupado, avise o setor de DESIGN ou o Leo!");
		return false;
		}
	var nodeASSET = selection.selectedNode(0);
	var nodePEG = selection.selectedNode(1);
		if(node.srcNode(selection.selectedNode(1), 0) == selection.selectedNode(0)){//troca se ele nao ler certo a selecao [0] e [1]
		nodeASSET = selection.selectedNode(1);
		nodePEG = selection.selectedNode(0);
		}
	nodesSel.push(nodeASSET);
	nodesSel.push(nodePEG);
		if(node.type(nodeASSET) == "READ" &&  node.type(nodeASSET) == "GROUP"){
		MessageBox.information("Tipo de Node invalido! Tem certeza que selecionou certo?");
		return false;
		}
		if(node.type(nodePEG) != "PEG"){
		MessageBox.information("Isto em cima do ASSET nao e uma PEG!");
		return false;
		}
	return nodesSel;
	}

	function checkASSET(nodeAsset, assetPeg){//funcao para verificar se o ASSET esta pronto para gerar TPL
	var tipo = node.type(nodeAsset);
	var numFrames = frame.numberOf();
		if(tipo == "READ"){
		var colunaD = node.linkedColumn(nodeAsset,"DRAWING.ELEMENT");
		var drawingsIn = column.getDrawingTimings(colunaD);
			if(drawingsIn.indexOf("Zzero") == -1){
			MessageBox.information("Falta criar o 'Zzero' para este ASSET!\nUse o Script BD_Zzero!");
			return false;
			} else if(numFrames != (drawingsIn.length-1)){
			MessageBox.information("Deixe este arquivo da seguinte forma antes de continuar:\n -Todos Drawings Expostos na Timeline (exeto o 'Zzero');\n - Somente os Drawings q serao usados na Library (Use o BD_CleanLibrary para apagar os nao usados);\n -A duracao dos frames acabando junto com os drawings expostos na Timeline;");
			return false;
			}
		}
		if(tipo == "GROUP" && numFrames != 8){
			if(MessageBox.information("Aparentemente este arquivo nao esta com a duração certa de frames para um RIG! Este RIG tem um turn diferente do padrao? (8 frames)\nSe sim, continue, se nao, corrija isso antes de enviar!", 3, 4) == 4){
			return false;
			}
		}
		if(node.getTextAttr(assetPeg, 1,"PIVOT.X") == 0 && node.getTextAttr(assetPeg, 1,"PIVOT.Y") == 0){
			if(MessageBox.information("O Pivot da peg STAGE parece errado!\nDeseja continuar?!", 3, 4) == 4){
			return false;
			}
		}
	return true;
	}

	function listaNodes(){//Lista todos nodes e sub nodes selecionados
	var listToFill = [];
	var groupList = [];
		for(var i=0; i< selection.numberOfNodesSelected(); i++){
		var selNode = selection.selectedNode(i);
			if(node.type(selNode)!="GROUP"){	
			listToFill.push(selNode);
			} else { 
			listaRecursivamente(node.subNodes(selNode));	
			groupList.push(selNode);
			}
		}
		function listaRecursivamente(sub){
		for(var y = 0;y<sub.length;y=y+1){
			if(node.type(sub[y]) != "GROUP"){
			listToFill.push(sub[y]);
			} else {
			listaRecursivamente(node.subNodes(sub[y]));
			groupList.push(sub[y]);
			}
		}
		}
	return listToFill.concat(groupList);;
	}	
	
	function getVersionName(name){//reto retorna versao do nome se tiver
	var version = name.slice(-4);
		if(version.slice(0,2).toUpperCase() == "_V" && !isNaN(version.slice(-2))){
		return version;
		}
		if(version[2].toUpperCase() == "V" && !isNaN(version[3])){
		return version.slice(-3);
		}
	return "";
	}
	function checkPallets(pltList){/*roda o resultado do script BD_CheckNODESUsedPalettes;
	[0] - nodeArray;
	[1] - drawArray;
	[2] - colorArray - subArray cores usadas por draw;
	[3] - PaletteAttay - subArray Palettas usadas por draw;
	*/
	var readNodes = pltList[0];
	var drawList = pltList[1];
	var corList = pltList[2];
	var nodesPalett = pltList[3];
	var usedPal = [];
		for(var i=0; i<nodesPalett.length; i++){
			for(var y=0; y<nodesPalett[i].length; y++){
				if(usedPal.indexOf(nodesPalett[i][y]) != -1){
				continue;	
				}
			usedPal.push(nodesPalett[i][y]);
			}
		}
		if(usedPal.length > 1){
		var mensagem = "Este ASSET utiliza mais de uma Palette: \n";
		for(item in usedPal){
			mensagem += (" -" + usedPal[item] + "\n");
			}
		mensagem += "Deseja criar o TPL mesmo assim?\n";
			if(MessageBox.warning(mensagem, 3,4) == 4){
			return false;
			}
		}
	return true;
	}
}

	

///////////////////////////////////////////////INICIO funcao da UI////////////////////////////////////////////////////////////////
function exportAprovDialog(assetName, project, selASSET){
// FIXME caminho da interface
this.ui = UiLoader.load("C:/_BirdoRemoto/_Harmony/UI/GerarTPL.ui");

//###### DEFINE INFORMAÇÕES INICIAIS###################//

this.libraryPath = getPaths(project)[3] + "LibraryTPLs/";
	if(!dirExists(this.libraryPath)){
	MessageBox.information("Erro ao encontrar a library: " + this.libraryPath);
	this.ui.close();
	return;
	}
this.prefixos = ["CHAR", "PROP", "FX", "ILUSTRA"];//FIXME:SE precisar adicionar Prefixo, adicione aqui!
this.ui.groupBox.comboTIPO.addItems(this.prefixos);

	for(var i=0; i<this.prefixos.length; i++){//ecolhe o prefixo baseado no nome
		if(assetName.slice(0,2) == this.prefixos[i].slice(0,2)){
		this.ui.groupBox.comboTIPO.setCurrentIndex(i);
		}
	}

this.arrName = assetName.split("_");
	//### CRIA COMBO LISTS e DEFINE NOME ####//
	this.ui.groupBox.spinBox.setValue(parseFloat(this.arrName[0].slice(-3)));//set numero spin (numero do prop)
	this.ui.groupBox.lineNome.text = assetName.replace((this.arrName[0] + "_"), "");//separa somente o nome para o lineName
	this.ui.labelPath.text = this.libraryPath + this.ui.groupBox.comboTIPO.currentText;//define path da library

	//### DEFINE VERSOES####///
	this.versionsLista = listVersions(assetName, this.ui.labelPath.text);
	this.ui.groupBox.comboVERs.addItems(this.versionsLista[0]);
	this.ui.groupBox.comboVERs.setCurrentIndex(this.versionsLista[1]);

	//### DEFINE TAGS COMBOS####///
	this.ui.tagCLASSE.addItems(getTags("CLASSE"));
	this.ui.tagSUBCLASSE.addItems(getTags("SUBCLASSE"));
	this.ui.tagTIPO.addItems(getTags(this.ui.groupBox.comboTIPO.currentText));

		if(node.type(selASSET[0]) == "READ"){//se for um ASSET simples, ele ja define como SIMPLES
		this.ui.tagCLASSE.setCurrentIndex(3);
		this.ui.tagCLASSE.enabled = false;
		} else if (node.type(selASSET[0]) == "GROUP"){
		this.	ui.tagCLASSE.removeItem(3);
			if(assetName.slice(0, 2) == "PR"){
			this.	ui.tagCLASSE.setCurrentIndex(2);
			this.ui.tagCLASSE.enabled = false;
			}
		}
	this.ui.lineTPL.text = assetName + "_" + this.ui.groupBox.comboVERs.currentText;

	//##### C A L L   B A C K   F U N C T I O N S #####//
	this.enableGroup = function(){
	this.ui.groupBox.enabled = this.ui.radioEscolherNome.checked;
		if(!this.ui.radioEscolherNome.checked){
		this.ui.lineNome.setText(assetName);
		}
	}

	this.updateVersionList = function(){
	this.ui.groupBox.comboVERs.clear();
	this.prefix = this.ui.groupBox.comboTIPO.currentText.slice(0, 2);
	this.number = ("000" + this.ui.groupBox.spinBox.text).slice(-3);
	this.nome = this.ui.groupBox.lineNome.text;
	this.saida = this.prefix + this.number + "_" + this.nome;
	this.versionsLista = listVersions(this.saida.toUpperCase(), this.ui.labelPath.text);
	this.ui.groupBox.comboVERs.addItems(this.versionsLista[0]);
	this.ui.groupBox.comboVERs.setCurrentIndex(this.versionsLista[1]);
	}

	this.updateTplName = function(){
	this.prefix = this.ui.groupBox.comboTIPO.currentText.slice(0, 2);
	this.number = ("000" + this.ui.groupBox.spinBox.text).slice(-3);
	this.nome = this.ui.groupBox.lineNome.text;
	this.saida = this.prefix + this.number + "_" + this.nome;
	this.ui.lineTPL.setText(this.saida.toUpperCase() + "_" + this.ui.groupBox.comboVERs.currentText);
	}

	this.changeTIPO = function(){
	this.ui.tagTIPO.clear();
	this.ui.tagTIPO.addItems(getTags(this.ui.groupBox.comboTIPO.currentText));
	this.ui.labelPath.text = this.libraryPath + this.ui.groupBox.comboTIPO.currentText;//define path da library
	this.updateVersionList();
	this.updateTplName();
	}

	this.changeNUMBER = function(){
	this.updateVersionList();
	this.updateTplName();
	}

	this.changeNAME = function(){
	this.updateVersionList();
	this.updateTplName();
	}
	
	this.changeVERSION = function(){
	this.updateTplName();
	}

	this.gerarTPL = function(){
		if(!checkName(this.ui.groupBox.lineNome.text)){
		return;
		}
	this.classe = this.ui.tagCLASSE.currentText;
		if(this.ui.tagSUBCLASSE.currentIndex == 0 || this.ui.tagTIPO.currentIndex == 0){
		MessageBox.information("Esolha todas as TAGs antes de continuar!");
		return;
		}
	this.tplName = this.ui.lineTPL.text;
	this.libTplPath = this.ui.labelPath.text;
		if(!dirExists(this.libTplPath)){
		MessageBox.information("Erro ao encontrar a library: " + this.libTplPath);
		this.ui.close();
		return;
		}
		if(this.tplName.slice(0, (this.tplName.length-4)) != assetName){
			if(MessageBox.warning("Tem certeza que deseja mudar o nome do Asset?? Melhor consultar a Producao ou o Leo antes de fazer isso!!\nO nome do arquivo do DESIGN ficara diferente do nome do TPL!\nLembre-se de atualizar isso!\n\nDeseja mudar o NOME do ASSET?? ", 3, 4) == 4){
			this.ui.close();
			return;
			}
		}
	this.nameNode = this.tplName;
		if(this.classe == "RIG COMPLETO"){//renomeia o grupo de versao do RIG completo
		this.vers = checkRIGCOMPLETO(selASSET[0]);
			if(this.vers != ""){
			this.versName = this.nameNode.replace(this.nameNode.slice(0, 6), project + ".")
			this.versName = this.versName.replace("_v", "-v");
			node.rename(this.vers, this.versName);
			}
		this.nameNode = this.tplName.slice(0, (this.tplName.length - 4));
		}
	var progressDlg;
	progressDlg = new QProgressDialog();
	progressDlg.modal = true;
	progressDlg.open();
	progressDlg.setRange(0, 8);
	progressDlg.setValue(0);

	progressDlg.setLabelText("Renomeando Nodes... ");
	renameNodesAsset(selASSET, this.nameNode);
		if(dirExists(this.libTplPath + "/" + this.tplName + ".tpl")){
			if(MessageBox.warning("Um tpl com o mesmo nome e versao escolhidos, ja exite na LibraryTPL!\nDeseja substituir?", 3, 4) == 4){
			this.ui.close();
			return;
			}
		progressDlg.setValue(1);
		progressDlg.setLabelText("Deletando template... " + this.tplName + ".tpl" );
		this.delTPL = deleteTPL(this.libTplPath + "/" + this.tplName + ".tpl");//Tenta deletar tpl existente
			if(!this.delTPL){
			this.ui.close();
			return;
			}
		}
	progressDlg.setValue(2);
	progressDlg.setLabelText("Criando TEMPLATE... ");
	this.template = copyPaste.createTemplateFromSelection(this.tplName, this.libTplPath);//cria o template e retorna o caminho
		if(this.template == ""){
		MessageBox.information("Não foi possível criar o template!");
		this.ui.close();
		return;
		}
	this.templatePath = this.libTplPath + "/" + this.template;
	progressDlg.setValue(3);
	progressDlg.setLabelText("Criando INFO txt... ");
	createInfoTEXT(this.templatePath);//cria o arquivo com info sobre o tpl//
	progressDlg.setValue(4);
	progressDlg.setLabelText("Criando TAG txt... ");
	createTAGSText(this.templatePath, this.ui.tagCLASSE.currentText, this.ui.tagSUBCLASSE.currentText,  this.ui.tagTIPO.currentText);//
	progressDlg.setValue(5);
	progressDlg.setLabelText("Gerando ThumbNails... ");
	createThumbnails(this.templatePath);//gera os thumbnails para o tpl criado//

		if(this.classe == "RIG COMPLETO"){
			if(MessageBox.information("Deseja limpar a Library de drawings do TPL eliminando todos desenhos 'X' e os nao necessarios nos FULLs?", 3,4) == 3){
			progressDlg.setValue(6);
			progressDlg.setLabelText("Limpando drawings TPL... ");
			batchScript((this.templatePath + "/scene.xstage"), "BD_CleanTpl_BAT.js");
			}
		}
	progressDlg.setValue(7);
	progressDlg.setLabelText("Limpando Palettes... ");
	batchScript((this.templatePath + "/scene.xstage"), "BD_CleanPalettes_BAT.js");
	progressDlg.setValue(8);
	progressDlg.hide();
	MessageBox.information("Template: " + this.template + " foi criado com sucesso!\nUm arquivo com info foi criado na pasta do tpl!");
	this.ui.close();
	return;
	}

	this.clickCancel = function(){
	MessageLog.trace("Gerar TPL CANCELADO!");
	this.ui.close();
	return;
	}

// ########### fim das CALL BACK FUNCTIONS ########### //
this.ui.radioNomeArquivo.toggled.connect(this,this.enableGroup);
this.ui.radioEscolherNome.toggled.connect(this,this.enableGroup);
this.ui.groupBox.comboTIPO["currentIndexChanged(int)"].connect(this,this.changeTIPO);
this.ui.groupBox.spinBox["valueChanged(int)"].connect(this,this.changeNUMBER);
this.ui.groupBox.lineNome.textEdited.connect(this,this.changeNAME);
this.ui.groupBox.comboVERs["currentIndexChanged(int)"].connect(this,this.changeVERSION);


this.ui.gerarTPL.clicked.connect(this,this.gerarTPL);
this.ui.buttonCancel.clicked.connect(this,this.clickCancel);

///////////////////////////////////////funcoes extras do DIALOG////////////////////////////
	function listVersions(name, path){//retorna [0] array com as versoes para o combo e [1] o index da proxima versao
	var versionList = [];
	var myDir = new Dir();
	myDir.path = path;
	var fileList = myDir.entryList("*.tpl",1,4);
		if(fileList == ""){
		versionList.push("v01");
		return [versionList, 0];
		}
	var nextVersionInd = 0;
		for(var i=0;i<fileList.length;i++){
		var item = fileList[i];
			if(item.slice(0, (item.length - 8)) == name){
			nextVersionInd = parseFloat(item.slice((item.length-6), (item.length-4)));
			break;
			}
		}
		for(var y=1; y<(nextVersionInd+13); y++){
		var ver = "v" + ("00" + y).slice(-2);
		versionList.push(ver);
		}
	return [versionList, nextVersionInd];
	}

	function getPaths(projeto){/*FUncao para pegar os caminhos na rede
	[0]: Titulo do Projeto;
	[1]: SubTitulo do Projeto;
	[2]: caminho da ANIMACAO na rede EP/1_Cenas ... EP/2_Render;
	[3]: caminho da pasta _tbLIB (BirdoLib, tplLib, _NOTES);
	[4]: caminho dos BGs prontos para importar;
	[5]: caminho para a pasta DESIGN;
	[6]: caminho BOARD na rede (0_Thumbnail, 1_Projetos, 2_Render_WIP, 3_Render_Aprovacao);
	[7]: caminho para BIBLIOTECA;*/
	var filepath = "//192.168.10.101/Compartilhado/TB_Scripts/Path_Library/" + projeto + ".txt";
	var pathList = [];
	var file = new File(filepath);
		if(file.exists){
		file.open(FileAccess.ReadOnly);
		var linhas = file.readLines();
			for(var i=0; i<linhas.length; i++){
			path = linhas[i].substring(0,(linhas[i].length - 1));
				if(path == ""){
				break;
				}
			pathList.push(path);
			}
		file.close;
		} else {
		MessageLog.trace("Este projeto ainda não foi documentado na Path_Library! Avise a Supervisão!");
		return false;
		}
	return pathList;
	}

	function getTags(tipoTag){//Gera lista de TAGs baseado no tipo dado como parametro
	var tagList = ["", ];
	var redeTagPath = "//192.168.10.101/Compartilhado/TB_Scripts/LibraryTPL/TAGS/";
	var tagsFile = redeTagPath + tipoTag + ".txt";
	var file = new File(tagsFile);
		if(!file.exists){
		MessageBox.information("Falha ao achar o arquivo de TAGs na rede! Avise o Leo!");
		return false;
		}
	file.open(FileAccess.ReadOnly);
	var lines = file.readLines();
	file.close();
		for(var i=0;i<lines.length;i++){
		var tagItem = lines[i].replace("\r", "");
			if(tagItem != ""){
			tagList.push(tagItem);
			}
		}
	return tagList;
	}

	function checkVersionInName(name){//checa s eo nome dado ja contem versao
	var version = name.slice(-3);
	return version[0].toUpperCase() == "V" && !isNaN(version.slice(-2)) || version[1].toUpperCase() == "V" && !isNaN(version[2]);
	}
	
	function createInfoTEXT(txtPath){//funcao para criar um arquivo txt com info sobre o tpl//
		if(!dirExists(txtPath)){
		MessageLog.trace("Falha ao criar o arquivo de INFO! Pasta nao existe!");
		return false;
		}
	var userName = "USUÁRIO: " + about.getUserName();
	var scenePath = "ARQUIVO DE ORIGEM: " + scene.currentProjectPath();
	var currVersion = "VERSÃO DA CENA: " + scene.currentVersionName();
	var data = "DATA: " + new Date();
	var version = "VERSÃO DO TOON BOOM: " + about.getVersionInfoStr();
	var _controle = txtPath + "/_LibraryTplINFO.txt";
	var file = new File(_controle);
	file.open(FileAccess.Append);
	file.writeLine(userName + ";");
	file.writeLine(scenePath + ";");
	file.writeLine(currVersion + ";");
	file.writeLine(data + ";");
	file.writeLine(version + ";");
	file.close();
	MessageLog.trace("arquivo controle criado com sucesso no caminho: " + _controle);
	}

	function createTAGSText(txtPath, tag1, tag2, tag3){//funcao para criar um arquivo txt com as tags escolhidas para o tpl
		if(!dirExists(txtPath)){
		MessageLog.trace("Falha ao criar o arquivo de txtTAGS! Pasta nao existe!");
		return false;
		}
	var _controle = txtPath + "/_LibraryTAGS.txt";
	var file = new File(_controle);
	file.open(FileAccess.Append);
	file.writeLine(tag1);
	file.writeLine(tag2);
	file.writeLine(tag3);
	file.close();
	MessageLog.trace("arquivo _LibraryTAGS criado com sucesso no caminho: " + _controle);
	}

	function createThumbnails(tpl){//funcao para gerar os thumbnails do template
	var command = specialFolders.bin + "/HarmonyPremium.exe";
	var commandArguments = [];
	commandArguments.push(command);
	commandArguments.push("-batch");
	commandArguments.push("-template");
	commandArguments.push(tpl);
	commandArguments.push("-thumbnails");
	commandArguments.push("-readonly");
	Process.execute(commandArguments);
	MessageLog.trace("Thumbnails do template " + tpl + " foram criados com sucesso!");
	}
	
	function checkRIGCOMPLETO(rig){//retorna o grupo versao do RIG COMPLETO
	var subNod = node.subNodes(rig);
	var groupsIn = [];
	var rigVers = "";
		for(var i=0; i<subNod.length; i++){
			if(node.type(subNod[i]) == "GROUP"){
			groupsIn.push(subNod[i]);
			}
		}
		if(groupsIn.length != 1){
			if(MessageBox.warning("Aparentemente este RIG nao e um RIG COMPLETO!\nDeseja continuar??", 3, 4) == 4){
			return false;
			}
		return rigVers;
		}
	return groupsIn[0];
	}


	function renameNodesAsset(selectionList, newName){//renomeia a selecao do Asset com o nome escolhido pela UI
	var rename = true;
	var pegName =  "STAGE_" + newName.split("_")[1] + "-P";
		if(!renameNode(selectionList[0], newName)){
		rename = false;
		}
		if(!renameNode(selectionList[1], pegName)){
		rename = false;
		}
		function renameNode(nod, name){
		var columnId = node.linkedColumn(nod,"DRAWING.ELEMENT");
		var elementKey = column.getElementIdOfDrawing(columnId);
			if(node.rename(nod, name)){
			column.rename(columnId, name);
			element.renameById(elementKey, name);
			MessageLog.trace("Node renomeado para: " + name);
			} else {
			MessageLog.trace("Falha ao renomear o node: " + nod);
			return false;
			}
		return true
		}
	return rename;
	}

	function batchScript(tbFile, scriptName){//funcao que roda o script desejado no arquivo
	var app = specialFolders.userConfig;
	var pref = app.slice((app.length-15), app.length);
	var scrip = pref.replace("full-", "");
	scrip = scrip.replace("pref", "scripts");
	var scriptPath = app.replace(pref, scrip) + "/" + scriptName;
	var command = specialFolders.bin + "/HarmonyPremium.exe";
	var commandArguments = [];
	commandArguments.push(command);
	commandArguments.push(tbFile);
	commandArguments.push("-batch");
	commandArguments.push("-compile");
	commandArguments.push(scriptPath);
	Process.execute(commandArguments);
	MessageLog.trace("Script: " + scriptName + " rodado com sucesso no arquivo: " + tbFile);
	}

	function dirExists(dirP){//checa se o diretorio existe
	var myDir = new Dir;
	myDir.path = dirP;
	return myDir.exists;
	}

	function checkName(assetName){//checa se o nome na linhaNome escolhido está no padrao (checa somente o campo linhaNome)
	var proibido = ["!", "@", "#", "%", "¨", "&", "*", "+","`", "´", ".", "~", "^" , "-", " "];
		if(assetName.length < 2){
		MessageBox.information("Escolha um Nome!");
		return false;
		}
		for(var i=0;i<proibido.length;i++){//checa se possui caracteres proibidos
			if(assetName.indexOf(proibido[i]) != -1){
			MessageBox.information("Nome Inválido! Caractere '" + proibido[i] + "' não permitido!");
			return false;
			}
		}
		if(assetName[assetName.length-1] == "_"){
		MessageBox.information("Nome Inválido! Não use '_' no fim do nome!");
		return false;
		}
	return true;
	}

	function deleteTPL(tplP){//remove o diretorio dado e todo conteudo
		if(tplP.slice(-4) != ".tpl"){
		MessageBox.information("Isto nao e um tpl: " + tplP + "\nImpossivel sobreescrever!\nMande este print pro leo!");
		return false;
		}
	var myDir = new Dir;
	myDir.path = tplP;
	myDir.rmdirs();
	MessageLog.trace("Tpl deletado: " + tplP);
	return true;
	}
}
