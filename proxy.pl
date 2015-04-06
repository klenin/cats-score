#!/usr/bin/perl
use strict;
use LWP::Simple;
use CGI;
my $q = CGI->new();
my $url = $q->param("u");
my $contents = get $url or die;
print $contents;
