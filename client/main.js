import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import Highcharts  from 'highcharts';
require('highcharts/modules/heatmap')(Highcharts);
require('highcharts/modules/treemap')(Highcharts);
require('highcharts/modules/boossst')(Highcharts);

import './main.html';

Template.hello.onCreated(function helloOnCreated() {
  // counter starts at 0
  this.counter = new ReactiveVar(0);


});



function createHigh(medias) {

    var points    = []
      , mediaP
      , mediaVal = 0
      , mediaI   = 0
      , mediaP
      , i
      , j
      , mediaI
      , tweets;

    for (i = 0; i < medias.length; i++) {
            mediaP = {
                id: 'id_' + medias[i]["_id"],
                name: medias[i]["_id"],
                color: Highcharts.getOptions().colors[i]
            };
            tweets = medias[i].retweets;
            for (j = 0; j < 150 ; j++) {
                tweetP = {
                    id: tweets[j].id + '_' + medias[i]["_id"],
                    name: tweets[j].text,
                    parent: mediaP.id
                };
                points.push(tweetP);
                tweetReP = {
                    id: medias[i]["_id"] + '_retweet_count',
                    name: "retweet",
                    parent: tweetP.id,
                    value: Math.round(tweets[j]["retweet_count"])
                };
                tweetFaP = {
                    id: medias[i]["_id"] + '_favorite_count',
                    name: "favorite",
                    parent: tweetP.id,
                    value: Math.round(tweets[j]["favorite_count"])
                };
                points.push(tweetReP,tweetFaP);

                mediaVal = mediaVal + tweetFaP.value + tweetReP.value;
            }
            mediaP.value =  Math.round(mediaVal /j);
            points.push(mediaP);
    }
    // console.log(points);
    $('#container').highcharts({
    series: [{
      turboThreshold : 9000,
        type: 'treemap',
        layoutAlgorithm: 'squarified',
        allowDrillToNode: true,
        // animationLimit: 1000,
        dataLabels: {
            enabled: false
        },
        levelIsConstant: false,
        levels: [{
            level: 1,
            dataLabels: {
                enabled: true
            },
            borderWidth: 3
        }],
        data: points
    }],
    subtitle: {
        text: 'Cliquez sur les zones pour plus de détail'
    },
    title: {
        text: 'Sujets ayant générés le plus de réaction par media'
    }
});

}


function getAllTweets() {
    var tweets;
    Meteor.call('getTweetsByUser', function(error, result){
        // console.log(result);
        createHigh(result);
    });
}

Template.Treemap.onRendered(function() {
  this.autorun(() => {
    var tweets = getAllTweets();
  });
});

Template.hello.helpers({
  counter() {
    return Template.instance().counter.get();
  },
});

Template.hello.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    instance.counter.set(instance.counter.get() + 1);
    Meteor.call("callTwitter");
  },
});
