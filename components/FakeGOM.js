
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



/***********************************************************
constants
***********************************************************/

// UUID uniquely identifying our component
// You can get from: http://kruithof.xs4all.nl/uuid/uuidgen here
const CLASS_ID = Components.ID("{917c40e0-16a1-11e0-ac64-0800200c9a66}");

// description
const CLASS_NAME = "Redirect plugin for those without GOMplayer";

// textual unique identifier
const CONTRACT_ID = "fakegom@make.gsl.go/fakegom;1";

const kSCHEME="gomcmd";

const kPROTOCOL_CONTRACTID = "@mozilla.org/network/protocol;1?name=" + kSCHEME;

const kPROTOCOL_NAME="GOMPlayer protocol";

// reference to the required base interface that all components must support
const nsISupports = Components.interfaces.nsISupports;

// reference to the interface needed for a Protocol handler
const nsIProtocolHandler = Components.interfaces.nsIProtocolHandler;

var externalService = Components.classes["@mozilla.org/uriloader/external-protocol-service;1"]
    .getService(Components.interfaces.nsIExternalProtocolService);


var ios = Components.classes["@mozilla.org/network/io-service;1"]
    .getService(Components.interfaces.nsIIOService);

const alert = Components.classes['@mozilla.org/alerts-service;1']
                  .getService(Components.interfaces.nsIAlertsService)
                  .showAlertNotification;


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
    protocolFlags: nsIProtocolHandler.URI_STD
    | nsIProtocolHandler.URI_LOADABLE_BY_ANYONE, 

    allowPort: function(port, scheme) 
    {
	// We don't need no steenking ports
	return false;
    },

    newURI: function(spec,charset,baseURI)
    {
	var uri = Components.classes["@mozilla.org/network/simple-uri;1"].createInstance(Components.interfaces.nsIURI);
	uri.spec=spec;
	return uri;
    },
    

    slurpPage: function (second_url)
    {

	var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
	.createInstance(Components.interfaces.nsIXMLHttpRequest);
	
	req.open('GET',second_url,false);
	req.send();
	
	var data=req.responseText;

	if (data == null)	    
	    {
		alert('Slurp failure');
		Components.utils.reportError("fakegom:failed slurp: " + second_url);
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
			Components.utils.reportError("fakegom:Regex fail(2):" + data);
		    }
		else
		    {    
			var appURL= "http" + reAnswer[1].substring(4);

			externalService.loadURI(ios.newURI(unescape(appURL.replace(/&amp;/g,"&"),null,null));
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
	
	if (reAnswer==null)
	    {	       
		Components.utils.reportError("fakegom:Regex fail(1):" + mainURL);
	    }
	else
	    {    
		this.slurpPage(reAnswer[1]);		
	    }

	// create dummy nsIChannel instance
	return ios.newChannel("javascript:document.location.href='" + mainURL + "'", null, null);
	
    },


  QueryInterface: function(aIID)
  {
    if (!aIID.equals(nsIProtocolHandler) &&    
        !aIID.equals(nsISupports))
      throw Components.results.NS_ERROR_NO_INTERFACE;
    return this;
  }
};

/***********************************************************
class factory

This object is a member of the global-scope Components.classes.
It is keyed off of the contract ID. Eg:

***********************************************************/
var FakeGOMFactory = {
  createInstance: function (aOuter, aIID)
  {
    if (aOuter != null)
      throw Components.results.NS_ERROR_NO_AGGREGATION;
    
    if (!aIID.equals(nsIProtocolHandler) && !aIID.equals(nsISupports))
	{ 
	    throw Components.results.NS_ERROR_NO_INTERFACE;
	}

    return (new FakeGOM()).QueryInterface(aIID); //Either this or 'return new Protocol()'
  }
};

/***********************************************************
Javascript XPCOM component registration goop
***********************************************************/

var FakeGOMModule = {

  registerSelf: function(aCompMgr, aFileSpec, aLocation, aType)
  {
      
      aCompMgr = aCompMgr.
      QueryInterface(Components.interfaces.nsIComponentRegistrar);
      
      aCompMgr.registerFactoryLocation(CLASS_ID, CLASS_NAME, 
				       kPROTOCOL_CONTRACTID, aFileSpec, aLocation, aType);
  },
  
  unregisterSelf: function(aCompMgr, aLocation, aType)
  {
      
      aCompMgr = aCompMgr.
      QueryInterface(Components.interfaces.nsIComponentRegistrar);
      aCompMgr.unregisterFactoryLocation(CLASS_ID, aLocation);        
  },
  
  getClassObject: function(aCompMgr, aCID, aIID)
  {
      if (!aIID.equals(Components.interfaces.nsIFactory))
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
      
      if (aCID.equals(CLASS_ID))
	  return FakeGOMFactory;
      
      throw Components.results.NS_ERROR_NO_INTERFACE;
  },
  
  canUnload: function(aCompMgr) { return true; }
};

/***********************************************************
module initialization

When the application registers the component, this function
is called.
***********************************************************/
function NSGetModule(aCompMgr, aFileSpec) { return FakeGOMModule; }

