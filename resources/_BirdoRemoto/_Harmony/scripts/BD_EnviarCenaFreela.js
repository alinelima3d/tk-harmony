"use strict";
/*V3.0 - Versao FINAL => compactacao local, backup do zip existente na rede e envio do zip desta cena, adiciona a rendeFazendinha na pata tbLib do projeto
-------------------------------------------------------------------------------
Name:		BD_EnviarCenaFreela.js

Description:	Este Script envia a cena  para pasta correta na rede e cria backup da versao antiga no mesmo destino

Usage:		Deve ser usado somente quando estiver trabalhando local; 	

Author:		Leonardo Bazilio Bentolila

Created:	2018 - Maio, 2020 (update); versao Home Office 2020
            
Copyright:   Camelo@ e leobazao_@Birdo
-------------------------------------------------------------------------------
*/
include("BD_RemoveUnusedPalettes.js");
include("BD_CopyScene.js");
include("BD_ProgressBarDupla.js");
include("BD_ZipScene.js");
include("BD_AddRenderFazendinha.js");

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

function BD_EnviarCenaFreela(){
	if(!checkFrames()){
	return;
	}

var currPath = scene.currentProjectPath();
var currScene = scene.currentScene();
var ep = currScene.split("_")[1];
//Pastas de envio na pasta birdoRemoto para preparar envio
var envioLocal = birdoRemoto + "_envios/" + ep;
var cenaLocal = envioLocal + "/_temp/" + currScene;

	if(!checaPadraoNome(currScene)){
	return;
	}

	if(!isLocal(currPath, rootRede)){
	return;
	}

var msg = "Este Script enviará um zip desta cena para a pasta de entrega de Freelas no Servidor da Birdo!\n\nEsta ação será dividida em 3 etapas:\n\n  -1) Backup da versao antiga na rede (zip);\n  -2) Compactação da cena local;\n  -3) Envio da cena;\n\nNão é possível interromper este processo! Isso pode levar alguns minutos dependendo da sua conexão com a REDE da Birdo e mesmo que a barra de progesso pareça travada, aguarde!!\n\nDeseja Continuar???";

	if(MessageBox.information(msg, 3, 4) == 4){
	return;
	}

	if(!checkVPN()){
	return;
	}

BD_RemoveUnusedPalettes();//limpa palhetas antes de enviar

var cenasEp = rootRede + "/132_Ninjin/1B_TEMPORADA/ANIMACAO_FREELA/" + ep + "/1_Cenas";// caminho das cena do Ep na rede

	if(!dirExist(cenasEp)){//checa se a pasta do ep ja foi criada
	MessageBox.information("A pasta do episodio na rede ainda nao foi criada!! Avise a supervisao!");
	return;
	}

var cenaRedeZIP = cenasEp + "/" + currScene + ".zip";
var backup = cenasEp + "/_backup";

	if(makeDir(backup)){//cria pasta backup do ep se nao existir
	MessageLog.trace("Pasta: " + backup + " criada com sucesso!");
	}

	if(!checkLock(cenaRedeZIP)){
	MessageLog.trace("cena aberta para render!");
	}

var logEnvio = currPath + "/_envio.log"
removeFile(logEnvio);
writeLog(logEnvio, "");
writeLog(logEnvio, "Arquivo de Origem: " + currPath + "/" + scene.currentVersionName() + ".xstage");

var pg = new BD_ProgressBarDupla("ENVIANDO CENA", "Isso pode levar alguns minutos...");//Importa UI progressBar
pg.ui.show();
pg.ui.groupBox.progressBar1.setRange(0, 5);

pg.ui.groupBox.label1.setText("Checando Backup...");
pg.ui.groupBox.progressBar1.setValue(1);

	if(fileExists(cenaRedeZIP)){
	pg.ui.groupBox.progressBar2.setRange(0, 3);
	pg.ui.groupBox.label2.setText("gerando versao backup...");
	pg.ui.groupBox.progressBar2.setValue(1);
	var backupVersion = getBackupVersion(backup, currScene);
		if(!copyFile(cenaRedeZIP, backup + "/" + backupVersion + ".zip")){
		MessageBox.information("Erro ao copiar o arquivo .zip para o backup!");
		pg.ui.close();
		return;
		}
	writeLog(logEnvio, "Arquivo Backup gerado: " + backupVersion);
	pg.ui.groupBox.label2.setText("Deletando cena Zip... " + cenaRedeZIP);
	pg.ui.groupBox.progressBar2.setValue(2);
	removeFile(cenaRedeZIP);
	pg.ui.groupBox.progressBar2.setValue(3);
	pg.ui.groupBox.progressBar2.reset();
	}

pg.ui.groupBox.label1.setText("Preparando Cena...");
pg.ui.groupBox.progressBar1.setValue(2);
	pg.ui.groupBox.progressBar2.setRange(0, 3);
	pg.ui.groupBox.progressBar2.setValue(1);
	pg.ui.groupBox.label2.setText("alterando Export Cena..." + currScene);
var renderPath = "//192.168.10.101/132_Ninjin/1B_TEMPORADA/ANIMACAO_FREELA/" + ep + "/2_Render/" + currScene;
changeExport(renderPath);
	pg.ui.groupBox.progressBar2.setValue(2);
	pg.ui.groupBox.label2.setText("Salvando cena...");
scene.saveAll();
	pg.ui.groupBox.progressBar2.setValue(3);
	pg.ui.groupBox.progressBar2.reset();

pg.ui.groupBox.label1.setText("Gerando Copia Cena...");
pg.ui.groupBox.progressBar1.setValue(3);
var sendLocal = BD_CopyScene(cenaLocal, pg);
	
	if(dirExist(cenaLocal)){
	logEnvio = cenaLocal + "/_envio.log";
	}
	if(sendLocal >0){
	MessageBox.information("Falha ao copiar cena local: " + sendLocal.length + " arquivos com falha!");
	writeLog(logEnvio, "Falha ao eviar os arquivos: " + sendLocal);
	pg.ui.close();
	return;
	}

	pg.ui.groupBox.progressBar2.setRange(0, 3);
	pg.ui.groupBox.progressBar2.setValue(1);
	pg.ui.groupBox.label2.setText("Compactando cena...");
var zipLocal = BD_ZipScene(cenaLocal, getBackupVersion(envioLocal, currScene), envioLocal);
		if(!zipLocal){
		MessageLog.trace("Falha ao compactar cena " + cenaLocal + " para envio!");
		}
	pg.ui.groupBox.label2.setText("Limpando cena temporaria..");
	pg.ui.groupBox.progressBar2.setValue(2);
removeDir(cenaLocal);
	pg.ui.groupBox.progressBar2.reset();

pg.ui.groupBox.label1.setText("Enviando zip da cena...");
pg.ui.groupBox.progressBar1.setValue(4);
	pg.ui.groupBox.progressBar2.setRange(0, 3);
	pg.ui.groupBox.progressBar2.setValue(1);
if(!copyFile(zipLocal, cenaRedeZIP)){
		MessageBox.information("Erro ao copiar o arquivo .zip para o backup!");
		pg.ui.close();
		return;
		}
	pg.ui.groupBox.progressBar2.setValue(2);
	pg.ui.groupBox.label2.setText("Adicionando a RenderFazendinha...");
var fazendinhaPath = rootRede + "/132_Ninjin/_tbLIB/_renderFazendinha";
var zipFazendinha = "Q:/1B_TEMPORADA/ANIMACAO_FREELA/" + ep + "/1_Cenas/"+ currScene + ".zip"; //precisa um caminho diferente aqui com o servidor mapeado
var renderF = BD_AddRenderFazendinha(zipFazendinha, fazendinhaPath);
MessageLog.trace(renderF);
	pg.ui.groupBox.progressBar2.setValue(3);

pg.ui.groupBox.progressBar1.setValue(5);
pg.ui.close();

MessageBox.information("AHHHHH MLK! Conseguimos!  \\o/\n\nCena enviada com sucesso para Rede!!\nA cena foi adicionada para fila da renderFazendinha, dependendo do tamanho da cena, e da quantidade de cenas na fila, o render estará disponivel em torno de 3 a 10 minutos na pasta de render do Episodio!!!\n\nBora la atualizar a tabela agora??");


//////////////////////////////////////////FUNCOES EXTRAS/////////////////////////////////////
	function makeDir(dirPath){//cria diretorio recusivamente
	var myDir = new Dir;
	myDir.path = dirPath;
		if(!myDir.exists){
		myDir.mkdir(dirPath);
		return true;
		}
	return false;
	}

	function removeDir(dirPath){//Remove a pasta dada como parametro
	var dir = new Dir;
	dir.path = dirPath;
		if(!dir.exists){
		MessageLog.trace("Diretorio nao encontrado: " + dirPath);
		return false;
		}
	MessageLog.trace("Diretorio removido..." + dirPath);
	dir.rmdirs();
	return true;
	}

	function dirExist(path){//checa se a pasta existe
	var dir = new Dir;
	dir.path = path;
	return dir.exists;
	}

	function fileExists(fn){
	var v = new File(fn);
	return v.exists;
	}

	function removeFile(filePath){//Deleta os arquivos de plt listados pelo RemoveUnusedPalettes
	var file = new File(filePath);
		if(file.exists){
		file.remove();
		MessageLog.trace("O arquivo: " + filePath + " foi removido!");
		}
	}

	function copyFile(copyPath, pastePath){//Copia um Arquivo para o caminho dado
	var fileToCopy = new PermanentFile(copyPath);
	var copyOfFile = new PermanentFile(pastePath);
	var copy = fileToCopy.copy(copyOfFile);
		if(!copy){
		MessageLog.trace("Fail to copy the file: '" + copyPath + "'!");
		} else { 
		MessageLog.trace("File: '" + pastePath + "' Copied!");
		}
	return copy;
	}

	function getBackupVersion(backupPath, cena){//retorna o nome da versao para o backup da cena
	var dir = new Dir;
	dir.path = backupPath;
	var lastVer = "v00";
	var fileList = dir.entryList("*", 3, 4);
		for(var i=0; i<fileList.length; i++){
			if(fileList[i].split("-")[0] == cena){
			lastVer = fileList[i].split("-")[1];
			}
		}
	var nextVer = (parseFloat(lastVer.replace("v", "")) + 1);
	return cena + "-v" + ("00" + nextVer).slice(-2);
	}

	function checkLock(zipRede){//checa se o zip da cena esta sendo acessado pela RF
	var lockRender = zipRede.replace(".zip", ".lock");
	var checkRender = checkLockFile(lockRender);
		if(checkRender != false){
		MessageBox.warning("A versao desta cena na rede esta aberta para BatchRender pelo computador: " + checkRender+ "\nNao sera possivel enviar agora.\nEspere alguns minutos e tente novamente!", 5, 0);
		return false;
		}
		function checkLockFile(filePath){
		var file = new File(filePath);
			if(file.exists){
			file.open(FileAccess.ReadOnly);
			var userOpen = file.readLine(0);
			file.close();
			return userOpen;
			}	
		return false;
		}
	return true;	
	}

	function isLocal(caminho, redeBirdo){//retorna se a cena está LOCAL ou na REDE
		if(caminho.indexOf(redeBirdo) != -1){
		MessageBox.information("Esta Cena está na rede! Este Script foi desenvolvido\npara somente ser usado no computador do Animador!");
		return false;
		}
	return true;
	}

	function checaPadraoNome(cena){//Checa se a cena tem nome padrao de cena!
	var scArr = cena.split("_");
		if(scArr.length != 3 || scArr[0].length != 3 || scArr[1].length != 3){
		MessageBox.information("O nome desta cena não está no padrão.\nImpossível mandar para aprovação!");
		return false;
		}else{
		return true;
		}
	}

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

	function writeLog(txtName, text){//cria um log com as infos sobre o envio
	var file = new File(txtName);
		if(!file.exists){
		file.open(FileAccess.WriteOnly);
		file.writeLine("---------------------------Envia Cena log---------------------------------" + "\r");
		file.writeLine("usuario: " + about.getUserName() + "\r");	
		file.writeLine("hora Envio: " + new Date() + "\r");
		file.close();
		MessageLog.trace("O arquivo '" + txtName + "' foi criado com sucesso!" );
		return;
		} else { 
		file.open(FileAccess.Append);
		file.writeLine(text + "\r");
		file.close();
		MessageLog.trace("O arquivo '" + txtName + "' foi atualizado com sucesso!"); 
		return;
		}
	}

	function checkFrames(){//Checa se a cena está com um numero diferente de frames do que deveria//
	var animatic = "Top/ANIMATIC_/Animatic"
	var columnAnimatic = node.linkedColumn(animatic,"DRAWING.ELEMENT");
	var arrayAnimatic = column.getDrawingTimings(columnAnimatic);
	var framesAnimatic = arrayAnimatic.length;
		if(framesAnimatic != frame.numberOf()){
			if(MessageBox.warning("O Número de Frames desta cena está diferente do Animatic!\nTem certeza que quer enviar esta cena assim mesmo?", 3, 4) == 4){
			return false;
			}
		}
	return true;
	}
	
	function changeExport(movieNAME){//funcao para mudar o WRITE node da cena baseado no nome dela//
	var nodeWrite = "Top/SETUP/Write_FINAL";
	node.setTextAttr(nodeWrite, "MOVIE_PATH", 0, movieNAME);
	}

}