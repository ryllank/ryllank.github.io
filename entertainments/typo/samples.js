//============================================================================
// Project:    Type
// Module:     
// File:       samples.js
// 
// Typo sample texts.
// 
// Copyright (C) Ryllan Kraft. 2002.  All rights reserved.
//============================================================================

var samples = [
  [ '', ''],
  [ 'A string', 
    "a sad lad shall ask dad flag a jag" ],
  [ 'Fox', 
    "the quick brown fox jumped over the lazy dog" ],
  [ 'Spain', 
    "The rain in Spain stays mainly in the plain." ],
  [ 'Sublime', 
    "Shall I compare thee to a summer's day\n"+
    "Thou art more lovely and more temperate\n" +
    "Rough winds do shake the darling buds of May\n" +
    "And summer's lease hath all too short a date\n" +
    "Sometime too hot the eye of heaven shines\n" +
    "And often is his gold complexion dimmed\n" +
    "And every fair from fair sometime declines\n" +
    "By chance or nature's changing course untrimmed\n" +
    "But thy eternal summer shall not fade\n" +
    "Nor loose possession of that fair thou ow'st\n" +
    "Nor shall Death brag thy wand'rest in his shade\n" +
    "When in eternal lines to time thou grow'st\n" +
    "So long as men can breath or eyes can see\n" +
    "So long lives this, and this gives life to thee." ],
  [ 'Ridiculous', 
    "T'was brillig and the slithy toves,\n"+
    "did gyre and gimbol in the wabe,\n"+
    "all mimsy were the borrowgroves,\n"+
    "and the mome raths outgrabe.\n"+
    "Beware the Jabbawock my son,\n"+
    "with jaws that bite and claws that catch,\n"+
    "beware the Jub-jub bird and shun,\n"+
    "the frumious Bandersnatch.\n"+
    "He took his vorpal sword in hand,\n"+
    "long time the manxome foe he sought,\n"+
    "till rested he by the tum tum tree,\n"+
    "and stood awhile in thought.\n"+
    "And while in uffish thought he stood,\n"+
    "the Jabbawock with eyes of flame,\n"+
    "came wiffling through the tulgy wood,\n"+
    "and burbled as it came.\n"+
    "One two through and through,\n"+
    "the vorpal blade went snicker snack,\n"+
    "he killed it dead and with its head,\n"+
    "he home galumphing came.\n"+
    "Oh hast thou slain the Jabbawock,\n"+
    "come to my arms my beamish boy,\n"+
    "oh frabjious day callou callay,\n"+
    "he chortled in his joy.\n"+
    "T'was brillig and the slithy toves,\n"+
    "did gyre and gimbol in the wabe,\n"+
    "all mimsy were the borrowgroves,\n"+
    "and the mome raths outgrabe." ],
];

function selectSample()
{
    var str = '';
    str += '<select name="selnSample" onchange="runSample(this)">\n';
    for (var e in samples)
    {
        var sample = samples[e];
        str += '<option value="'+ e + '"';
        if (e == 0) str += ' selected';
        str += '>' + sample[0] + '\n';
    }
    str += '</select>\n';
    return str;
}

function runSample(seln)
{
    var s = seln.selectedIndex;
    var e = seln.options[s].value;
    var str = samples[e][1];
    matchString(str);
    seln.blur();
}

function runFile(butn)
{
    var filename = document.frmSample.filName.value;
    if (filename)
    {
        matchFile(filename);
    }
    butn.blur();
}

function runText(butn, text)
{
    if (text)
    {
        text = text.split('\n');
        for (var i = 0; i < text.length; i++)
        {
            var bit = text[i];
            bit = bit.split('\r');
            bit = bit.join('');
            text[i] = bit;
        }
        text = text.join('\n');
        matchString(text);
    }
    butn.blur();
}
