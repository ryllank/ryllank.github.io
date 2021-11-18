//============================================================================
// Project:    Typo
// Module:     
// File:       typo.js
// 
// Typo script.
// 
// Copyright (C) Ryllan Kraft. 2002.  All rights reserved.
//============================================================================

var resultArea;
var matchTextArea;
var typedTextArea;

var matchingLine = false;
var matchingStrings = false;

var matchStrings;
var matchStringsIndex;
var matchText;
var matchPosn;
var typedText;

var startTime;
var nrCorrect;
var nrDone;

var fso;

function initialise()
{
    if (typeof(idResultArea) != "undefined")
    {
        resultArea = idResultArea;
        matchTextArea = idMatchTextArea;
        typedTextArea = idTypedTextArea;
    }
    else if (document.getElementById)
    {
        resultArea = document.getElementById("idResultArea");
        matchTextArea = document.getElementById("idMatchTextArea");
        typedTextArea = document.getElementById("idTypedTextArea");
    }
    if (typeof(resultArea) == "undefined")
    {
        alert('This needs Dynamic HTML to operate\n' +
              '(e.g. use MS Internet Explorer 4+ or Netscape Navigator version 6+)');
    }
    else if (typeof(resultArea.innerHTML) == "undefined")
    {
        alert('This needs the Dynamic HTML "innerHTML" property to operate\n' +
              '(e.g. use MS Internet Explorer 4+ or Netscape Navigator 6+)');
    }
}

function initialiseResults()
{
    startTime = new Date().getTime();
    nrCorrect = 0;
    nrDone = 0;
    resultArea.innerHTML = "";
    typedTextArea.innerHTML = "";
}

function formatNumber(x, decplaces)
{
    var z = x;
    if (!decplaces) decplaces = 2;
    var factor = Math.pow(10, decplaces);
    z = Math.round(x * factor)/factor;
    return z;
}

function showResults()
{
    var elapsedTime = (new Date().getTime() - startTime)/1000;
    var str;
    str = "Done: " + nrDone;
    str += "<br>\nCorrect: " + nrCorrect;
    str += "<br>\nTime (secs): " + formatNumber(elapsedTime, 2);
    str += "<br>\nSpeed (correct): " + formatNumber((60.0*nrCorrect)/elapsedTime, 2);
    str += "<br>\nAccuracy (correct/done): " +  formatNumber((100.0*nrCorrect)/nrDone, 2);
    str += "%";
    resultArea.innerHTML = str;
    document.frmSample.selnSample.selectedIndex = 0;
}

function matchLine(str)
{
    matchingLine = true;
    initialiseResults();
    setLine(str);
}

function setLine(str)
{
    matchText = str;
    matchPosn = 0;
    updateMatch();
    typedText = "";
    typedTextArea.innerHTML = typedText;
}

function matchString(str)
{
    matchStrings = str.split('\n');
    matchingStrings = true;
    initialiseResults();

    matchStringsIndex = 0;
    setLine(matchStrings[matchStringsIndex++]);
}

function getPath()
{
    path= window.location.toString().split("///");
    path = path[1].split("/");
    path[path.length-1] ="";
    path=path.join("\\")
    path=path.replace(/\%20*/g," ");
    return path; 
}

function matchFile(filename)
{
    var ok = false;
    var count = 0;
    if (typeof(fso) == "undefined")
    {
        if (typeof(ActiveXObject) != "undefined")
        {
            var cmd = 'fso = new ActiveXObject("Scripting.FileSystemObject");'
            var tryit = false;
            var msie = navigator.appVersion.indexOf('MSIE');
            if (msie != -1)
            {
                var ver = navigator.appVersion.charAt(msie + 5);
                if (ver >= 5)
                {
                    tryit = true;
                }
            }
            if (tryit)
            {
                cmd = 'try { ' + cmd + ' }\n';
                cmd += 'catch (e) { ';
                cmd += 'alert("Failed to start the Scripting.FileSystemObject\\n';
                cmd += 'Error: "+e.description);';
                cmd += ' }';
            }
            eval(cmd);
        }
        else
        {
            alert("Needs Internet Explorer with ActiveXObject & the Scripting.FileSystemObject to load a file");
            fso = null;
            return;
        }
        if (!fso)
        {
            alert("Needs the Scripting.FileSystemObject to load a file");
            fso = null;
            return;
        }
    }
    if (!fso)
    {
        alert("Cannot load a file");
        fso = null;
        return;
    }

    if (!fso.FileExists(filename))
    {
        filename = getPath() + "\\" + filename;
    }
    if (fso.FileExists(filename))
    {
        var f = fso.OpenTextFile(filename, 1/*ForReading*/, false);
        if (f != null)
        {
            while (!f.AtEndOfStream)
            {
                var s = f.ReadLine();
                //alert(s);
                if (s.length > 0)
                {
                    if (!ok) matchStrings = new Array();
                    ok = true;
                    matchStrings[count++] = s;
                }
            }
        }
        else
        {
            alert("Failed to open "+filename);
        }

        f.Close();

        if (ok)
        {
            matchingStrings = true;
            initialiseResults();

            matchStringsIndex = 0;
            setLine(matchStrings[matchStringsIndex++]);
        }
    }
    else
    {
        alert("File "+filename+" not found");
    }
}

function updateMatch()
{
    if ((matchPosn >= 0) && (matchPosn < matchText.length))
    {
        var front = matchText.slice(0, matchPosn);
        var current = matchText.slice(matchPosn, matchPosn + 1);
        var back = matchText.slice(matchPosn + 1);
        matchTextArea.innerHTML = front + "<span class=clsCurrentText>" + 
            current + "</span>" +
            back;
    }
    else
    {
        matchTextArea.innerHTML = matchText;
    }
}

function keyPressed(e)
{
    var chcode;
    var tgt;
    if (typeof(event) != "undefined")
    {
        chcode = event.keyCode;
        tgt = event.srcElement;
    }
    else
    {
        chcode = e.charCode;
        tgt = e.target;
    }
    if (tgt == document.frmSample.txtaTextA)
    {
        return true;
    }
    ch = String.fromCharCode(chcode);
    if (matchingLine || matchingStrings)
    {
        if (chcode == 13)
        {
            matchingLine = false;
            matchingStrings = false;
            showResults();
        }
        else
        {
            nrDone++;
            if (chcode == matchText.charCodeAt(matchPosn))
            {
                nrCorrect++;

                typedText += ch;
                typedTextArea.innerHTML = typedText;

                matchPosn++;

                updateMatch();

                if (matchPosn >= matchText.length)
                {
                    if (matchingLine)
                    {
                        matchingLine = false;
                        showResults();
                    }
                    else if (matchingStrings)
                    {
                        if (matchStringsIndex < matchStrings.length)
                        {
                            setLine(matchStrings[matchStringsIndex++]);
                        }
                        else
                        {
                            matchingStrings = false;
                            showResults();
                        }
                    }

                }
            }
        }
    }
    return false;
}

document.onkeypress = keyPressed;
