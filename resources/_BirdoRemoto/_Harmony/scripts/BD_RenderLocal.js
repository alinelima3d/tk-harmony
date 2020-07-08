"use strict";
/*V2.0 - 
-------------------------------------------------------------------------------
Name:		BD_RenderLocal.js

Description:	Este Script renderiza a cena na pasta local em _BirdoRemoto

Usage:		Renderiza uma versao baixa da cena na pasta local de render

Author:		Leonardo Bazilio Bentolila

Created:	2020, Maio
            
Copyright:   leobazao_@Birdo
-------------------------------------------------------------------------------
*/
var rootRede = null;
var birdoRemoto = null;
//define os caminhos necessarios local e rede de cada OS
	if(about.isMacArch()){//define caminhos no Mac
	birdoRemoto = "/Users/" + about.getUserName() + "/Library/_BirdoRemoto/";
	} else if(about.isWindowsArch()){//define caminhos no Windows
	birdoRemoto = "C:/_BirdoRemoto/";
	} else {
	MessageBox.information("Sistema Operacional Nao suportado pra esse Script!\nSorry!!");
	return;
	}

function BD_RenderLocal(){
var render = false;

scene.beginUndoRedoAccum("Render Local");

var currPath = scene.currentProjectPath();
var currScene = scene.currentScene();
var ep = currScene.split("_")[1];

	if(!checaPadraoNome(currScene)){
	return;
	}

	if(!checkFrames()){
	return;
	}

var renderLocalEp = birdoRemoto + "_Render/" + ep;

	if(!dirExist(renderLocalEp)){
		if(makeDir(renderLocalEp)){//cria pasta backup do ep se nao existir
		MessageLog.trace("Pasta: " + renderLocalEp + " criada com sucesso!");
		}
	}

var renderLocal = renderLocalEp + "/" + currScene;

	if(!changeBGSetup()){
	MessageLog.trace("Falha ao Mudar BG, ou nao foi preciso mudar!");
	}

var escala = changeExport(renderLocal);//muda write node para o render local


Action.perform("onActionComposite()");

	if(node.getName(escala) != ""){
	node.deleteNode(escala, true, true);
	}

scene.endUndoRedoAccum();
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

	function dirExist(path){//checa se a pasta existe
	var dir = new Dir;
	dir.path = path;
	return dir.exists;
	}

	function checaPadraoNome(cena){//Checa se a cena tem nome padrao de cena!
	var scArr = cena.split("_");
		if(scArr.length != 3 || scArr[0].length != 3 || scArr[1].length != 3){
		MessageBox.information("O nome desta cena não está no padrão.\nEste script foi feito para renderizar cenas padrões de animação!!");
		return false;
		}else{
		return true;
		}
	}
	
	function checkFrames(){//Checa se a cena está com um numero diferente de frames do que deveria//
	var animatic = "Top/ANIMATIC_/Animatic"
	var columnAnimatic = node.linkedColumn(animatic,"DRAWING.ELEMENT");
	var arrayAnimatic = column.getDrawingTimings(columnAnimatic);
	var framesAnimatic = arrayAnimatic.length;
		if(framesAnimatic != frame.numberOf()){
			if(MessageBox.warning("O Número de Frames desta cena está diferente do Animatic!\nTem certeza que quer renderizar assim mesmo?", 3, 4) == 4){
			return false;
			}
		}
	return true;
	}
	
	function changeExport(movieNAME){//funcao para mudar o WRITE node da cena 
	var nodeWrite = "Top/SETUP/Write_FINAL";
	var coordX = node.coordX(nodeWrite);
	var coordY = node.coordY(nodeWrite);
	var scale = node.add("Top/SETUP", "scale-Out", "SCALE", coordX, (coordY -10), 0);
	node.setTextAttr(nodeWrite, "MOVIE_PATH", 0, movieNAME);
	node.setTextAttr(scale, "RES_Y", 0, 405);
	node.unlink(nodeWrite, 0);
	node.link("Top/SETUP/FINAL", 0, scale, 0);
	node.link(scale, 0, nodeWrite, 0);
	return scale;
	}

	function changeBGSetup(){
	var bgGroup = "Top/BG-G";
		if(node.getName(bgGroup) == ""){
		return false;
		}
	return node.setTextAttr(bgGroup + "/CAMERA/Visibility", "SOFTRENDER", 1, false);
	}
}