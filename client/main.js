import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import Highcharts  from 'highcharts';
require('highcharts/modules/heatmap')(Highcharts);
require('highcharts/modules/treemap')(Highcharts);


import './main.html';

Template.hello.onCreated(function helloOnCreated() {
  // counter starts at 0
  this.counter = new ReactiveVar(0);


});

function createTagsChart(medias, containerName, mediaName) {
    var tweetTags = [];

    var dataInformations = []
    for (i = 0; i < medias.length; i++) {
       for (j = 0; j < medias[i]._id.length; j++) {
          if(medias[i]._id[j] in tweetTags) {
              tweetTags[medias[i]._id[j]] += medias[i].tagCount;
          } else {
            tweetTags[medias[i]._id[j]] = medias[i].tagCount;
          }
       }
    }

    var tagsNumber = []
    var i=0;
    for (var tweetTag in tweetTags) {
      tagsNumber[i] = tweetTags[tweetTag];
      i++;
    }
      console.log(tweetTags);
      console.log(tagsNumber);
      tweetTags.splice(-1,1);
  $(containerName).highcharts({
    title: {
        text: mediaName
    },

    subtitle: {
        text: 'Plain'
    },

    xAxis: {
        categories: Object.keys(tweetTags)
    },

    series: [{
        type: 'column',
        colorByPoint: true,
        data: tagsNumber,
        showInLegend: false
    }]

});


$('#plain').click(function () {
    chart.update({
        chart: {
            inverted: false,
            polar: false
        },
        subtitle: {
            text: 'Plain'
        }
    });
});

$('#inverted').click(function () {
    chart.update({
        chart: {
            inverted: true,
            polar: false
        },
        subtitle: {
            text: 'Inverted'
        }
    });
});

$('#polar').click(function () {
    chart.update({
        chart: {
            inverted: false,
            polar: true
        },
        subtitle: {
            text: 'Polar'
        }
    });
});

};


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
    Meteor.call('getTweetsByUser', function(error, result){
        // console.log(result);
        createHigh(result);
    });
}

function getAllTagsFromUser(media, month, containerName) {
    Meteor.call('getTagsFromUser', media, month, function(error, result){
        // console.log(result);
        createTagsChart(result, containerName, media);
    });
}

Template.Treemap.onRendered(function() {
  this.autorun(() => {
    var tweets = getAllTweets();
  });
});

Template.body.events({
    "click .generate": function () {      
      var month = $( "#month" ).val();;
      console.log(month);
      Meteor.call('getTagsFromUser', "lemondefr", month, function(error, result){
          // console.log(result);
          createTagsChart(result, "#container", "lemondefr");
      });
      Meteor.call('getTagsFromUser', "BBCBreaking", month, function(error, result){
          // console.log(result);
          createTagsChart(result, "#container2", "BBCBreaking");
      });
      Meteor.call('getTagsFromUser', "CNN", month, function(error, result){
          // console.log(result);
          createTagsChart(result, "#container3", "CNN");
      });
    },
  });

Template.topTag.onRendered(function() {
  this.autorun(() => {
    var month = $('#month').find(":selected").text();
    var tweets = getAllTagsFromUser("lemondefr", month, "#container");
  });
});

Template.topTagBBC.onRendered(function() {
  this.autorun(() => {
    var month = $('#month').find(":selected").text();
    var tweets = getAllTagsFromUser("BBCBreaking", month, "#container2");
  });
});

Template.topTagCNN.onRendered(function() {
  this.autorun(() => {
    var month = $('#month').find(":selected").text();
    var tweets = getAllTagsFromUser("CNN", month, "#container3");
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
