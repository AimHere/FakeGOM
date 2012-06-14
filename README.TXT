README for the FakeGOM plugin
=============================


FakeGOM is a firefox plugin, intended to allow access to GOMTV's streamed
broadcasts to people unable or unwilling to use Gretech's proprietary, and
Windows|Mac-only gomplayer.

This way this plugin was originally intended to work was simple; open the
supplied 'fakegom-X.Y.Z.xpi' file with firefox, (File/Open File from the
main menu) and then choose to Install the plugin from the dialogue box.
When GOMTV is broadcasting, click on the appropriate stream link from their
site, and navigate the application helper box to your media player of choice
(e.g. vlc). Your media player should then attempt to play the stream.

There's a catch, though.

Back in the past, GOMTV were a bit wary of having too many people using
non-gomplayer streams so at some point, they actively started blocking vlc from 
accessing their stream. To work around this, you may have to pass the stream
through something like wget or curl in order to pass it through to VLC, since
they can mimic the gomplayer useragent strings. 

For Linux users, I've provided a small script for using wget and VLC to play
the stream, in the 'scripts' directory. Point the application helper at the script,
called 'gomplay', instead of VLC if you find VLC isn't working for you.

Note that I have had success in watching the paid (as opposed to free) GSL and GSTL
streams in vlc in Windows, without needing this workaround. Consider this an added
incentive to pay for a GOMTV subscription!

David