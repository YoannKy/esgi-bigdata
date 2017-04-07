import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import Highcharts  from 'highcharts';

require('highcharts-boost')(Highcharts);
require('highcharts-more')(Highcharts);
require('highcharts/modules/heatmap')(Highcharts);
require('highcharts/modules/treemap')(Highcharts);

import './main.html';

function createTreemap(medias) {
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
            var tweets = medias[i].retweets;
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
    $('#treemap-container').highcharts({
      series: [{
            turboThreshold : 0,
            type: 'treemap',
            layoutAlgorithm: 'squarified',
            allowDrillToNode: true,
            animationLimit: 1000,
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

function createPieDon(medias) {
    var colors      = Highcharts.getOptions().colors
      , points      = []
      , mediaP
      , mediaVal    = 0
      , i
      , j
      , data        = []
      , typeData    = []
      , followP
      , categories  = []
      , drillDataLen
      , retP;

    for (i = 0; i < medias.length; i++) {
      mediaP = {
          color : colors[i]
      };

      categories.push(medias[i]["_id"]);

      var tweets = medias[i].retweets
        , retweet = 0
        , favorit = 0;

      for (j = 0; j < tweets.length ; j++) {
          retweet+=tweets[j]['retweet_count'];
          favorit+=tweets[j]['favorite_count']
          followP = {
              name :  medias[i]["_id"],
              categories : ['nombre de retweet', 'nombre de favoris'],
              data : [retweet, favorit],
              color : colors [i]
          }

          mediaVal =   retweet + favorit;
      }
      mediaP.y = mediaVal;
      mediaP.drilldown = followP;
      points.push(mediaP)
    }

    for (i = 0; i < points.length; i += 1) {

        // add  data
        data.push({
            name: categories[i],
            y: points[i].y,
            color: points[i].color
        });

        // add version data
        drillDataLen = points[i].drilldown.data.length;
        for (var j = 0; j < drillDataLen; j += 1) {
            brightness = 0.2 - (j / drillDataLen) / 5;
            typeData.push({
                name: points[i].drilldown.categories[j],
                y: points[i].drilldown.data[j],
                color: Highcharts.Color(points[i].color).brighten(brightness).get()
            });
        }
    }

    $('#piedon-container').highcharts({
      chart: {
          type: 'pie'
      },
      title: {
          text: 'Repartion des favoris et des retweet par media, sur + de 9000 tweets'
      },
      subtitle: {
          text: 'Source: API Twitter'
      },
      yAxis: {
          title: {
              text: 'Total percent market share'
          }
      },
      plotOptions: {
          pie: {
              shadow: false,
              center: ['50%', '50%']
          }
      },
      tooltip: {
          valueSuffix: ''
      },
      series: [{
          name: 'Media',
          data: data,
          size: '60%',
          dataLabels: {
              formatter: function () {
                  return this.y > 5 ? this.point.name : null;
              },
              color: '#ffffff',
              distance: -30
          }
      }, {
          name: 'Type',
          data: typeData,
          size: '80%',
          innerSize: '60%',
          dataLabels: {
              formatter: function () {
                  return this.y > 1 ? '<b>' + this.point.name + ':</b> ' + this.y : null;
              }
          }
      }]
    });
}

function createHeatmap(medias) {
    var days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
      , categories = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
      , j
      , day
      , mediaArray = []
      , valueArray = [0,0,0,0,0,0,0]
      , mediaNameArray = []
      , tweet = [];

      for (let i = 0; i < medias.length; i++) {
          valueArray = [0,0,0,0,0,0,0];
          mediaNameArray.push(medias[i]["_id"]);
          tweet = medias[i].retweets;
          for (j = 0; j < tweet.length; j++) {
              if(days.includes(tweet[j].created_at.substring(0,3))) {
                  day = days.indexOf(tweet[j].created_at.substring(0,3));
                  valueArray[day]++;
              }
          }
          for (let ind = 0; ind < valueArray.length; ind++) {
            mediaArray.push([i, ind, valueArray[ind]]);
          }
      }

      $('#heatmap-container').highcharts({
        chart: {
            type: 'heatmap',
            marginTop: 40,
            marginBottom: 80,
            plotBorderWidth: 1
        },


        title: {
            text: 'Nombre de tweets envoyés par media par jours les 2 derniers mois'
        },

        xAxis: {
            categories: mediaNameArray
        },

        yAxis: {
            categories: categories,
            title: null
        },

        colorAxis: {
            min: 0,
            minColor: '#FFFFFF',
            maxColor: Highcharts.getOptions().colors[0]
        },

        legend: {
            align: 'right',
            layout: 'vertical',
            margin: 0,
            verticalAlign: 'top',
            y: 25,
            symbolHeight: 280
        },

        tooltip: {
            formatter: function () {
                return '<b>' + this.series.xAxis.categories[this.point.x] + '</b> a tweeté  <br><b>' +
                    this.point.value + '</b>  fois le<br><b>' + this.series.yAxis.categories[this.point.y] + '</b>';
            }
        },

        series: [{
            name: 'Tweets par media',
            borderWidth: 1,
            data: mediaArray,
            dataLabels: {
                enabled: true,
                color: '#000000'
            }
        }]

  });

}

function createSpider(medias) {
    var followersArray = []
      , interactArray  = []
      , followers      = 0
      , interact       = 0
      , mediaNameArray = []
      , tweet = [];

    for (let i = 0; i < medias.length; i++) {
        followers = 0;
        interact  = 0;
        mediaNameArray.push(medias[i]["_id"]);
        tweet = medias[i].retweets;
        for (let j = 0; j < tweet.length; j++) {
              if(followers < tweet[j].followers) followers = tweet[j].followers;
              interact +=(tweet[j].retweet_count + tweet[j].favorite_count);
        }
        followersArray.push(followers);
        interactArray.push(interact);
    }


    $('#spider-container').highcharts({
      chart: {
          polar: true,
          type: 'line'
      },

      title: {
          text: 'Followers vs Interactions(retweet et favoris)',
          x: -80
      },

      pane: {
          size: '80%'
      },

      xAxis: {
          categories: mediaNameArray,
          tickmarkPlacement: 'on',
          lineWidth: 0
      },

      yAxis: {
          gridLineInterpolation: 'polygon',
          lineWidth: 0,
          min: 0
      },

      tooltip: {
          shared: true,
          pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f}</b><br/>'
      },

      legend: {
          align: 'right',
          verticalAlign: 'top',
          y: 70,
          layout: 'vertical'
      },

      series: [{
          name: 'Nombre total de followers',
          data: followersArray,
          pointPlacement: 'on'
      }, {
          name: 'Nombre d\'interaction sur les tweets',
          data: interactArray,
          pointPlacement: 'on'
      }]
    });
}

function getAllTweets() {
    Meteor.call('getTweetsByUser', function(error, result){
        createTreemap(result);
        createPieDon(result);
        createHeatmap(result);
        createSpider(result);
    });
}

Template.chart.onRendered(function() {
  this.autorun(() => {
    var tweets = getAllTweets();
  });
});

Template.generateData.events({
  'click button'(event, instance) {
    Meteor.call("callTwitter");
  },
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

function getAllTagsFromUser(media, month, containerName) {
    Meteor.call('getTagsFromUser', media, month, function(error, result){
        // console.log(result);
        createTagsChart(result, containerName, media);
    });
}

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
