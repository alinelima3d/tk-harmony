/*V2.0 => agora com funcao getPahts (local remoto)
-------------------------------------------------------------------------------
Name:		BD_GetNOTES.js

Description:	Este script permite selecionar um drawing para procurar na Timeline se ele está exposto. 

Usage:		Escolha o drawing e pressione Find para achar a proxima exposição dele na timeline;

Author:		Leonardo Bazilio Bentolila

Created:	Outubro, 2018 _________Update Maio, 2020.
            
Copyright:   Camelo@  leobazao_@Birdo
------------------------------------------------------------------------------
*/
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

function BD_GetNOTES(){
scene.beginUndoRedoAccum("Import Notes");

var _notes = "Top/_NOTES";
var currScene = scene.currentScene()

	if(!checaPadraoNome(currScene)){
	return;
	}

	if(node.getName(_notes)==""){
	MessageBox.information("Essa cena não tem um espaço dedicado para receber notes.");
	return;
	}

	if(!checkVPN()){
	return;
	}

var paths = getPaths(currScene.split("_")[0]);

 	if(!paths){
	return;
	}

//Caminho onde os notes serão salvos devem ser escritos nessa variavel "pathToNotes"
var notesPATH = rootRede + paths[3] + "_NOTES";

var template = selectNoteTemplate(notesPATH, currScene);
	if(template=="CANCELED"){
	return
	}

disableNotes(_notes);

copyPaste.setPasteSpecialCreateNewColumn(true);
copyPaste.usePasteSpecial(true);
copyPaste.setExtendScene(true);
copyPaste.setPasteSpecialColorPaletteOption("DO_NOTHING");
var tpl = copyPaste.pasteTemplateIntoScene(template,"",1);

	if(!tpl){
	MessageBox.information("Falha ao importar o NOTE para esta cena!\nAvise o Leo!");
	}

node.moveToGroup(selection.selectedNodes(0), _notes);

MessageBox.information("Note importada com sucesso!");

scene.endUndoRedoAccum();

////////////////////////////////////////////////////////FUNCOES EXTRAS////////////////////////////////////////////////////////////
	function disableNotes(notesGroup){//desabilita todos os notes dentro do grupo _NOTES)
	var sub = node.subNodes(notesGroup);
		for(item in sub){
			if(node.type(sub[item])=="READ"){
			node.setEnable(sub[item], false);
			}
		}
	}

	function selectNoteTemplate(pathToNotes, cena){//Dialog para escolher note 
	var myDir = new Dir();
	myDir.path = pathToNotes;
	var foldersList = myDir.entryList("*",1,4);
	var tplList = [];
	var itemList = [];
		for(var i=0; i<foldersList.length; i++){
			if(foldersList[i].indexOf(cena) != -1){
			tplList.push(myDir.filePath(foldersList[i]));
			itemList.push(foldersList[i].split("-")[1]);
			}
		}
	var myDialog = new Dialog();
	myDialog.title = "Puxar Note";
	myDialog.okButtonText = "Puxar Note";

	var l1 = new Label();
	l1.text = "Escolha o NOTE para puxar pra cena";
	myDialog.add(l1);

	var c = new ComboBox();
	c.label = "Notes da cena " + cena.split("_")[2] + ":"
	c.itemList = itemList;
	myDialog.add(c);

		if(myDialog.exec()){
		return  tplList[c.currentItemPos];
		}else{
		MessageLog.trace("Import Note CANCELED!");
		return "CANCELED";
		}
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

	function checaPadraoNome(cena){//Checa se a cena tem nome padrao de cena!
	var scArr = cena.split("_");
		if(scArr.length != 3 || scArr[0].length != 3 || scArr[1].length != 3){
		MessageBox.information("O nome desta cena não está no padrão.\nImpossível Puxar notes!!");
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

}