import { Meteor } from 'meteor/meteor';
Meteor.startup(() => {
    Tweets = new Mongo.Collection("tweets");

    const Twitter = new Twit({
        consumer_key:         'Nzjwn07r4mjC9Ol2KuFHEhkDu', // API key
        consumer_secret:      'YkOv5AUuws5vThXr97Co612MhngfSUdYnAWmx2oF3NcxwGT97Y', // API secret
        access_token:         '849211176953282564-D5n45eFHV3bglVG1JxXr8s8IANOvmIr',
        access_token_secret:  'lMiGJa9zwcYbbaabUEcbByFjVU4VyoSa9EV0SHyj4NjVB'
    });

     Meteor.methods({
        checkTwitter: function () {
          var result = {}
            //  search twitter for all tweets containing the word 'banana'
            //  since Nov. 11, 2011
            Twitter.get('search/tweets',
                {
                    q: 'banana since:2011-11-11',
                    count: 1
                },
                function(err, data, response) {
                  console.log(data);
                }
            );

        },
    });
});

// Meteor.methods({
//       checkTwitter: function () {
//           this.unblock();
//           return Meteor.http.call("GET", "http://search.twitter.com/search.json?q=perkytweets");
//       }
//   });
