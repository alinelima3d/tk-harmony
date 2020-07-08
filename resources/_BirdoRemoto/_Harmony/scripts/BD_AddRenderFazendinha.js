/*v1.0
-------------------------------------------------------------------------------
Name:		BD_AddRenderFazendinha.js

Description:	Este Script adiciona o caminho da cena dada a fila da renderFazendinha escolhendo a melhor fila de render

Usage:		Chamar como include em outros Scripts! (OBS:. precisa do parametro  Root do caminho da rede //192.168...) e do arquivo _listaMAQUINAS.txt em compartilhado para listar maquinas disponiveis

Author:		Leonardo Bazilio Bentolila

Created:	Maio, 2020.
            
Copyright:  leobazao_@Birdo
-------------------------------------------------------------------------------
*/
//RETORNA duas opcoes:1) false (caso algum parametro esteja errado , 2) Mensagem com info sobre a fila criada
function BD_AddRenderFazendinha(scenePath, fazendinha){
var filaFile = fazendinha + "/_listaMAQUINAS.txt";
var listaPCs = getFilas(filaFile);
var cena = nomeDaCena(scenePath);
var dir = new Dir;
dir.path = fazendinha;

	if(!dir.exists){
	return "Falha ao conectar a pasta " + fazendinha;
	}

var fileList = dir.entryList("*.txt", 2, 2);
	for(var i=0; i<fileList.length; i++){//checa se ja existe em alguma fila a cena
	var item = fileList[i];
		if(item.indexOf(cena) != -1){
		return "Cena ja esta na fila!!";
		}
	}

	if(!cena){
	MessageBox.information("Erro no caminho dado! " + scenePath);
	return false;
	}

	if(!listaPCs){
	return "Falha ao encontrar o arquivo '_listaMAQUINAS'!";
	}

	if(listaPCs.length == 0){
	MessageLog.trace("Nao ha computadores configurados para RenderFazendinha no momento!");
	return false;
	}

	if(listaPCs.length == 1){
	return addFilaRender(scenePath, cena, listaPCs[0]);
	}

var nextFila = getNextFila(fileList, listaPCs);

return addFilaRender(scenePath, cena, nextFila);

////////////////////FUNCOES EXTRAS//////////////////////////////////
	function nomeDaCena(fn){//Funcao para pegar o nome da cena do Fullpath da cana
	fn = fn.replace(".zip", "");
	var splitArray = fn.split("/");
		if(splitArray.length > 0) {
		return splitArray[splitArray.length - 1];
		}
	MessageLog.trace("Caminho dado para adicionar a render fazendinha invalido!\n" + fn); 
	return false;
	}

	function getFilas(listaFIle){//Retorna lista com as FILAS de computadores configurados pra render [0] fila [1] info computer
	var filaList = [];
	var file = new File(listaFIle);
		if(!file.exists){
		MessageLog.trace("Falha ao encontrar o arquivo '_listaMAQUINAS'!");
		return false;
		}
	file.open(FileAccess.ReadOnly);
	var filas = file.readLines();
	file.close();
		for(var i=2; i<filas.length; i++){
			if(filas[i] == "\r"){
			break;
			}
		var linha = filas[i].slice(0, filas[i].length-2);//retira o \r do fim da linha
		filaList.push(linha);
		}
	return filaList;
	}

	function addFilaRender(caminhoCena, cenaName, linhaFila){//adiciona a cena enviada para fila da renderFazendinha
	var user = about.getUserName();
	var txtFile = fazendinha + "/" + linhaFila.split("_")[0]  + "_" + cenaName + ".txt"
	var file = new File(txtFile);
	file.open(FileAccess.WriteOnly);
	file.writeLine(user + ">>" + caminhoCena);
	file.close();
	return "Fila : " + linhaFila.split("_")[0] + "  computador : " + linhaFila.split("_")[1];
	}
	
	function getNextFila(lista, itens){		
	var ordem = [];
		for(var i=0; i<itens.length; i++){
		var novoItem = countItem(lista, itens[i].split("_")[0]) + "-" + itens[i];
		ordem.push(novoItem);	
		}
	ordem.sort();
	return ordem[0].split("-")[1];

		function countItem(arr, item){
		var count = 0;
			for(var i=0; i<arr.length;i++){
				if(arr[i].split("_")[0] == item){
				count++;
				}	
			}
		return count;
		}
	}
}