/*
-------------------------------------------------------------------------------
Name:		BD_ZipScene.js

Description:	Este script compacta a cena dada como parametro para a pasta de destino dada;

Usage:		Usado como include em outros scripts;

Author:		Leonardo Bazilio Bentolila

Created:	Maio, 2020;
            
Copyright:   leobazao_@Birdo
-------------------------------------------------------------------------------
*/

function BD_ZipScene(srcScene, zipName, dstPath){
	if(!dirExist(srcScene)){
	MessageBox.information("ZIPScene: Falha ao encontrar arquivo TB de Origem!");
	return false;
	}

	if(!dirExist(dstPath)){
	MessageBox.information("ZIPScene: Falha ao encontrar diretorio de destino!");
	return false;
	}

var zipper = find7Zip();
var zipFile = dstPath + "/" + zipName + ".zip";

System.processOneEvent();

var process = new Process2(zipper, "a", "-tzip", escapeSpaces(zipFile), escapeSpaces(srcScene));
var ret = process.launch();// let's home this worked.
	if(ret != 0){
	MessageBox.information("Erro ao comprimir cena: " + zipFile);
	return false;
	} else {
	return zipFile;
	}


//////////////////////////FUNCOES EXTRAS////////////////////////////////////////////////////////
	function fileExists(fn){
	var v = new File(fn);
	return v.exists;
	}

	/* find 7zip binary - used to zip template */
	function find7Zip() {
	var p;
		if(about.isMacArch() || about.isLinuxArch()){
		p = specialFolders.bin + "/bin_3rdParty/7za";
			if(fileExists(p)){
			return p;
			}
		p = specialFolders.bin + "/../../external/macosx/p7zip/7za";
			if(fileExists(p)){
			return p;
			}
		} else if (about.isWindowsArch()){
		p = specialFolders.bin + "/bin_3rdParty/7z.exe";
			if(fileExists(p)){
			return p;
			}
		}
    
	MessageBox.error("cannot find 7zip to compress template. aborting");
	throw new Error("cannot find 7zip");
	}

	function dirExist(path){//checa se a pasta existe
	var dir = new Dir;
	dir.path = path;
	return dir.exists;
	}

	function escapeSpaces(f){//adiciona "" aspas
		if(about.isWindowsArch()){
		var v = "\"\"" + f + "\"\""
		return v;
		}
	return f;
	}
}
