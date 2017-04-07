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

----------------------------------------------------
        getTagsFromUser : function (media, month) {
          var tweets =[];
          tweets = Tweets.aggregate(
              {$match : {"user.screen_name": media, "created_at": {$regex: month} } }, 
              {$group :{_id : "$entities.hashtags.text", tagCount : {$sum : 1}}}
          );
       
          return tweets;
        }

        ---------------------------------------
<template name="tags">
  <select id="month">>
    <option value="Mar" selected="selected">March</option> 
    <option value="Apr">April</option>
  </select>
  <button type="button" class="generate">generate</button>
  {{> topTag}}
  {{> topTagCNN}}
  {{> topTagBBC}}
</template>

<template name="topTag">
        <span class="huge-text">Reserved for charts</span>
        <div id="container"></div>
</template>

<template name="topTagCNN">
        <span class="huge-text">Reserved for charts</span>
        <div id="container3"></div>
</template>

<template name="topTagBBC">
        <span class="huge-text">Reserved for charts</span>
        <div id="container2"></div>
</template>
        