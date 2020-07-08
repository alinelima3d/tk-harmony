/*
-------------------------------------------------------------------------------
Name:		BD_1-ScriptLIB_File.js

Description:	Este script armazena a lib de funções relativas a Files e Dir;

Usage:		Usar em outros scripts atraves do include

Author:		Leonardo Bazilio Bentolila

Created:	junho, 2020.
            
Copyright:  leobazao_@Birdo
-------------------------------------------------------------------------------
*/

//#####################JSON files#####################//
	/*cria arquivo JSON com objeto e caminho dados como parametro
	@objeto => javascript object
	@fileName => arquivo json a ser criado
	*/
	function BD1_WriteJsonFile(objeto, fileName){
	this.jsonString = JSON.stringify(objeto, null, 2);
	this.file = new File(fileName);
		try {
		file.open(FileAccess.WriteOnly);
		file.write(jsonString);
		file.close();
		return true;
		} catch (err){
		MessageBox.warning( "Error while writing Json file:\n" + "File name: " + filename, 1, 0, 0);
		}
	return false;
	}

	/*le o arquivo JSON e retorna o objeto javascript
	@jsonFile => arquivo json a ser covertido
	*/
	function BD1_ReadJSONFile(jsonFile){
	this.file = new File(jsonFile);
		if(!this.file.exists){
		MessageBox.information("Convert JSON to Object ERRO: Arquivo dado como parametro nao existe!");
		return false;
		}
	file.open(FileAccess.ReadOnly);
	this.lines = file.read(jsonFile);
	file.close();
	return JSON.parse(this.lines);
	}

