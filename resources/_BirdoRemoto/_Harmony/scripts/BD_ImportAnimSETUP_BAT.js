/*
-------------------------------------------------------------------------------
Name:		BD_ImportAnimSETUP_BAT.js

Description:	Este Script importa e faz o SETUP da cena;

Usage:		Usar como BAT e para include em alguns scripts

Author:		Leonardo Bazilio Bentolila

Created:	Abril, 2020.
            
Copyright:  leobazao_@Birdo
 
-------------------------------------------------------------------------------
*/
function BD_ImportAnimSETUP_BAT(){

	if(node.getName("Top/SETUP") != ""){
	MessageBox.information("Esta cena Ja tem SETUP!");
	return false;
	}

var animatic = checkStoryBoardPro();
	if(!animatic){
	return false;
	}

var sArr = scene.currentScene().split("_");
var proj = String(sArr[0]);
var ep = String(sArr[1]);
var paths = getPaths(proj);

	if(!paths){
	return false;
	}
//Pasta para pegar o SETUP
var pathSETUP = paths[3] + "/LibraryTPLs/Setups/ANIM_setup.tpl";
var renderPath = paths[2] + ep + "/2_Render/";

	if(!dirExist(pathSETUP)){
	MessageBox.information("template SETUP nao encontrado!\n'" + pathSETUP + "'");
	return false;
	}

limpaCena();

copyPaste.setPasteSpecialCreateNewColumn(true);
copyPaste.usePasteSpecial(true);
copyPaste.setExtendScene(false);
copyPaste.pasteTemplateIntoScene(pathSETUP, "", 1);

changeExport(renderPath);

node.setAsGlobalDisplay("Top/SETUP/_PREVIEW");
node.setTextAttr(animatic,"CAN_ANIMATE",1,"N");
node.moveToGroup(animatic,"Top/ANIMATIC_" );
node.setLocked("Top/ANIMATIC_/Animatic",true);

MessageLog.trace("Setup da cena: " + scene.currentScene() + " concluido com sucesso!");
return paths;

/////////////////FUNCOES EXTRAS////////////////////////////////
	function changeExport(exportDir){//funcao para mudar o WRITE node da cena baseado no nome dela//
	var movieNAME = exportDir + scene.currentScene();
	var nodeList = node.subNodes("Top/SETUP");
		for(item in nodeList){
			if(node.type(nodeList[item]) == "WRITE"){
			node.setTextAttr(nodeList[item], "MOVIE_PATH", 0, movieNAME);
			}
		}
	}

	function dirExist(path){//checa se a pasta existe
	var dir = new Dir;
	dir.path = path;
	return dir.exists;
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
	//funcao para limpar a cena antes de importar o  SETUP
	function limpaCena(){
	var allNodes = node.subNodes(node.root());
		for(var i=0; i<allNodes.length; i++){
			if(node.getName(allNodes[i]) != "Animatic"){
			node.deleteNode(allNodes[i]);
			}
		}
	}

	//Checa se a cena é uma cena padrão exportada do StoryBoard Pro
	function checkStoryBoardPro(){
	var anim = "Top/Animatic";
		if(node.getName(anim) == ""){
		MessageBox.information("Esta cena aparentemente não é uma cena padrão exportada do StoryBoard Pro!");
		return false;
		}
	return anim;
	}

}