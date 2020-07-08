  /*V2.0 => agora com funcao getPahts (local remoto)
-------------------------------------------------------------------------------
Name:		BD_SendNOTES.js

Description:	Este Script envia o NOTE escolhido para rede.

Usage:		Usado pela Supervisao de Animacao. Cria tpl para ser puxado pelo animador

Author:		Leonardo Bazilio Bentolila

Created:	Outubro, 2018 _________Update Maio, 2020.
            
Copyright:    Camelo@  leobazao_@Birdo
-------------------------------------------------------------------------------
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

function BD_SendNOTES(){
var _notes = "Top/_NOTES";
var currScene = scene.currentScene()

	if(node.getName(_notes)==""){
	MessageBox.information("Essa cena não tem um espaço dedicado para receber notes.")
	return;
	}

	if(!checkVPN()){
	return;
	}

	if(!checaPadraoNome(currScene)){
	return;
	}

var notesContent = [];
var notesNodes = node.subNodes(_notes);

	for(item in notesNodes){
		if(node.type(notesNodes[item])=="READ"){
		notesContent.push(notesNodes[item]);
		}
	}

	if(notesContent.length==0){
	MessageBox.information("Não há Notes Para enviar nessa cena!");
	return;
	}

	var noteNode = chooseNoteDrawing(notesContent);

	if(noteNode=="CANCELED"){
	return;
	}



var paths = getPaths(currScene.split("_")[0]);

 	if(!paths){
	return;
	}

//Caminho onde os notes serão salvos devem ser escritos nessa variavel "pathToNotes"
var pathToNotes = rootRede + paths[3] + "_NOTES";

selection.clearSelection();
selection.addNodeToSelection(noteNode);

var progressDlg;
progressDlg = new QProgressDialog();
progressDlg.open();
progressDlg.setRange(0, 4);

progressDlg.setLabelText("Enviando TEMPLATE");
progressDlg.setValue(1);
var tplName = currScene + "-" + node.getName(noteNode);
var templateName = copyPaste.createTemplateFromSelection(tplName, pathToNotes);

	if(templateName == ""){
	MessageBox.warning("ERRO ao criar o template!", 1,0);
	return;
	}

var tplPath = pathToNotes + "/" + templateName;

progressDlg.setLabelText("Escrevendo Log");
progressDlg.setValue(2);
writeLog(tplPath, currScene);

progressDlg.setLabelText("Escrevendo Log");
progressDlg.setValue(3);
batchScript(tplPath, "BD_RemoveUnusedPalettes")
progressDlg.setValue(4);

progressDlg.hide();

var msg = "Os notes do drawing '" + node.getName(noteNode) + "' foram salvos em\n\n" + pathToNotes + "\n\ncom o nome de '" + templateName + "' e estão prontos para serem puxados pelo animador.";

MessageBox.information(msg);

////////////////////////////////////////////////////////FUNCOES EXTRAS////////////////////////////////////////////////////
	function chooseNoteDrawing(notesLista){//funcao para escolher a note a enviar
	var d = new Dialog();
	d.title = "Enviar Note";
	d.okButtonText = "Mandar Note"
	var itemList = [];	

		for(var i=0; i<notesLista.length; i++){
		itemList.push(node.getName(notesLista[i]));
		}		

	var cb = new ComboBox();
	cb.itemList = itemList;
	cb.label = "Notes da Cena: ";
	d.add(cb);
	
		if(d.exec()){
		var nodePath = notesLista[cb.currentItemPos];
		node.setEnable(nodePath, true);
		return nodePath;
		}else{
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

	function writeLog(template, cena){//cria um log no template de destino
	var txtName = template + "/_noteINFO.log";
	var file = new File(txtName);
		if(!file.exists){
		file.open(FileAccess.WriteOnly);
		file.writeLine("---------------------------Envia NOTE log---------------------------------" + "\r");
		file.writeLine("SUPERVISOR: " + about.getUserName() + "\r");
		file.writeLine("Arquivo de Origem: " + cena);
		file.writeLine("hora Envio: " + new Date() + "\r");
		file.close();
		MessageLog.trace("O arquivo '" + txtName + "' foi criado com sucesso!");
		return;
		} else { 
		return;
		}
	}
	
	function batchScript(tbFile, scriptName){//funcao que roda o script desejado no arquivo
	var app = specialFolders.userConfig;
	var pref = app.slice((app.length-15), app.length);
	var scrip = pref.replace("full-", "");
	scrip = scrip.replace("pref", "scripts");
	var systemScripts = app.replace(pref, scrip);
	var command = specialFolders.bin + "/HarmonyPremium.exe";
	var commandArguments = [];
	commandArguments.push(command);
	commandArguments.push(tbFile);
	commandArguments.push("-batch");
	commandArguments.push("-compile");
	commandArguments.push(scriptName);
	Process.execute(commandArguments);
	MessageLog.trace("Script: " + scriptName + " rodado com sucesso no arquivo: " + tbFile);
	}
}