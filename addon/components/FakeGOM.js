
/**********************************************************
FakeGOM Firefox plugin for handling gomcmd: and gomp2p:    
protocols, for purposes of bringing the GSL to all you good
people out there in Linux-land. BSD, Mac, and even Windows
people are welcome to use it too, of course.

Copyright 2011 David Sinclair, but, bleah, just do whatever 
the hell you want with this, within reason.

The author has no affiliation with, is not employed by, is
not endorsed by, and to the best of his knowledge has never
ever met any of:
Gretech Corp, GOMTV, GomPlayer, the GomTV Starleague, Artosis, 
Tasteless, John the Translator, Lee Hyeon-Joo, Lilsusie,
SuperDanielMan, Automaton 2000, or Uniden.

************************************************************/
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");

/***********************************************************
constants
***********************************************************/

// UUID uniquely identifying our component
// You can get from: http://kruithof.xs4all.nl/uuid/uuidgen here
const CLASS_ID = Components.ID("{917c40e0-16a1-11e0-ac64-0800200c9a66}");

// description
const CLASS_NAME = "FakeGOM";

// textual unique identifier
const CONTRACT_ID = "fakegom@make.gsl.go/fakegom;1";
const kSCHEME="gomcmd";
const kPROTOCOL_CONTRACTID = "@mozilla.org/network/protocol;1?name=" + kSCHEME;
const kPROTOCOL_NAME="GOMPlayer protocol";

// reference to the required base interface that all components must support
const nsISupports = Ci.nsISupports;

// reference to the interface needed for a Protocol handler
const nsIProtocolHandler = Ci.nsIProtocolHandler;

var externalService = Cc["@mozilla.org/uriloader/external-protocol-service;1"]
    .getService(Ci.nsIExternalProtocolService);
var ios = Cc["@mozilla.org/network/io-service;1"]
    .getService(Ci.nsIIOService);


var prefs = Cc["@mozilla.org/preferences-service;1"]
    .getService(Ci.nsIPrefService).getBranch("extensions.fakegom.");
      
function debugSpew(message)
{
    // Check for debugmode, if debugmode spew debug spam

    var spew = true;
    var spew = prefs.getBoolPref("debugmode");
    if (spew) Cu.reportError("fakegom:" + message);
};


/***********************************************************
class definition
***********************************************************/

//class constructor
function FakeGOM() 
{
};

// class definition
FakeGOM.prototype = 
{
    scheme: kSCHEME,
    // Security Profile, so that the Error log stops moaning
    protocolFlags: nsIProtocolHandler.URI_NORELATIVE |
    nsIProtocolHandler.URI_NOAUTH |
    nsIProtocolHandler.URI_LOADABLE_BY_ANYONE, 

    allowPort: function(port, scheme) 
    {
	debugSpew("allowPort");
	// We don't need no steenking ports
	return false;
    },

    newURI: function(spec,charset,baseURI)
    {
	//	debugSpew("newURI");
	var uri = Cc["@mozilla.org/network/simple-uri;1"].createInstance(Ci.nsIURI);
	uri.spec=spec;
	return uri;
    },
    
    slurpPage: function (second_url)
    {
	var req = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"]
	.createInstance(Ci.nsIXMLHttpRequest);
	
	req.open('GET',second_url,false);
	req.send();
	
	var data=req.responseText;

	if (data == null)	    
	    {
		debugSpew("failed slurp: " + second_url);
	    }
	else
	    {
		// Better here to trap the <ref href = "wibble" and treat differently if it's gomp2p: or other:
		
		var refree =   /LiveAddr=(.*)\&amp;Format=(...)/; //Free GSL stream
		var reunfree = /<ref.*href=\"(.*)\"/i;            //Unfree GSL stream

		var reAnswer = refree.exec(data);

		if (reAnswer == null)
		    {
			reAnswer = reunfree.exec(data);
		    }		    
		
		if (reAnswer==null)
		    {	       
			debugSpew("Regex fail(2):" + data);
		    }
		else
		    {    
			var appURL= "http" + reAnswer[1].substring(4);
			
			//Optional debug messages
			debugSpew("html: " + data);
			debugSpew("html: " + unescape(appURL.replace(/&amp;/g,"&")));
			

			//There may be local URLs that need to be handled too.
			externalService.loadURI(ios.newURI(unescape(appURL.replace(/&amp;/g,"&")),null,null));
		    }

	    }

    },


    newChannel: function(input_uri)
    {
	
	//   This function and slurpPage contain the actual useful code that does actual stuff, rather than the
	//   necessary yet utterly turgid bureaucratic shitfuckery that most of this plugin consists of.
	
	var mainURL = input_uri.spec;
	var regEx = new RegExp("(http:\/\/.*)\&title");

	var reAnswer=regEx.exec(mainURL);

	debugSpew("newChannel");
	
	if (reAnswer==null)
	    {	       
		debugSpew("Regex fail(1):" + mainURL);
	    }
	else
	    {    
		this.slurpPage(reAnswer[1]);		
	    }

	// create dummy nsIChannel instance
	return ios.newChannel("javascript:document.location.href='" + mainURL + "'", null, null);
	
    },
    
    classDescription: CLASS_NAME,
    contractID: kPROTOCOL_CONTRACTID,
    classID: CLASS_ID,    
    QueryInterface: XPCOMUtils.generateQI([Ci.nsIProtocolHandler]),


};


if (XPCOMUtils.generateNSGetFactory)
    {
	var NSGetFactory = XPCOMUtils.generateNSGetFactory([FakeGOM]);
	Cu.reportError("fakegom: Registering Firefox 4.0 Factory");
    }
else
    {
	var NSGetModule = XPCOMUtils.generateNSGetModule([FakeGOM]);
	//Can't use debugSpew here, since the debugmode entry isn't created yet
	Cu.reportError("fakegom: Registering Firefox 3.* module");
    }
