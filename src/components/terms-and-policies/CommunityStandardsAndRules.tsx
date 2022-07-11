import React from 'react';

interface Props {
  className?: string;
}

function CommunityStandardsAndRules({ className }: Props) {
  return (
    <div className={className}>
      <h2 className="h3 border-bottom pb-2">Community Standards and Rules</h2>
      <p>
        A lot of effort has been put forth to create a friendly atmosphere on
        Slasher, so we created some very basic Community Standards. These are
        the general rules we&apos;ve created, so you and others can enjoy your
        time on Slasher.
      </p>
      <p>Last updated: May 7, 2021</p>
      <h3 className="h4">Posts You Don&apos;t Like</h3>
      <p>
        If you see something here you just don&apos;t like, but it&apos;s not
        breaking any of these rules, you have total control over what&apos;s on
        your timeline. Click the three dots to the upper right corner of the
        post and you can hide that post. Alternately, if that&apos;s not enough,
        you can unfriend or block anyone you don&apos;t care to see posts from
        anymore.
      </p>
      <h3 className="h4">Illegal Content / Goods / Services</h3>
      <p>
        Posts referring to goods or services that are considered to be illegal
        are not allowed. This includes information or links to websites and/or
        apps that provide pirated movies, drugs, prostitution, etc.
      </p>
      <h3 className="h4">Hate Speech &amp; Symbols</h3>
      <p>
        This is absolutely not tolerated. This includes posting, commenting, or
        displaying hate toward others in writing, images, or otherwise.
      </p>
      <h3 className="h4">Harassment / Bullying / Unwelcome Posts &amp; Messages</h3>
      <p>
        Don&apos;t harass, bully, post, or send messages that may be considered
        unwelcome. This includes anything relating to appearance, race, sexual
        orientation, gender, or other personal identifiers, as well as anything
        sexually explicit. Be respectful when communicating with others.
      </p>
      <p>
        If someone is harassing you, you have options and we are here to help!
      </p>
      <p>
        1) Take a screenshot of the message or post in question and send it to
        help@slasher.tv. That is necessary if you want a moderator from Slasher
        to help resolve the issue. If you provide no proof of someone breaking a
        rule, there is no basis to take action for you.
      </p>
      <p>
        2) You can block any users for the most immediate results, but be sure
        to take screenshots prior to blocking them, if you would like a
        moderator from Slasher to take action.
      </p>
      <p>
        3) Moderators from Slasher can only take action if rules have been
        broken on Slasher. We do not moderate other apps, websites, etc.
      </p>
      <h3 className="h4">Trolling</h3>
      <p>
        If we decide you are posting in a way that is determined to provoke
        others in a negative way, your account will be suspended indefinitely.
      </p>
      <h3 className="h4">Spam &amp; Promotional Messages</h3>
      <p>
        Posting the same thing (images and/or text) multiple times is considered
        spam. You are welcome to post similar things, but be sure to change it
        up enough so it appears to be different and people can enjoy what
        you&apos;re posting. Give people a reason to like what you do and remain
        friends with you.
      </p>
      <p>
        No messages are to be sent for promotional purposes, unless directly
        requested. Promotional posts are allowed on the timeline and in the
        appropriate groups/threads.
      </p>
      <h3 className="h4">Religion / Politics</h3>
      <p>
        No political or religious themes, posts, or comments. We want to keep
        the atmosphere enjoyable here and free from those topics.
      </p>
      <h3 className="h4">Sexually Explicit Content</h3>
      <p>Any posts depicting sexually explicit imagery are not allowed.</p>
      <h3 className="h4">Promotion &amp; Sale of Nude Content</h3>
      <p>
        In the future, we are planning to create a section for people to sell
        their nude content. At the moment though, there&apos;s no soliciting or
        promoting the sale of nude content on Slasher. That includes Only Fans,
        premium Snapchat, cam shows, etc.
      </p>
      <h3 className="h4">Unsolicited Nudes</h3>
      <p>
        No unsolicited nudes of any kind should be shared through messages,
        posts, and/or comments/replies to other people&apos;s posts on Slasher.
        If you&apos;re caught sending unsolicited nudes, your account will be
        suspended indefinitely.
      </p>
      <h3 className="h4">General Nudity</h3>
      <p>
        Everyone is allowed to post nudity on their own timeline, but only in
        the context of R rated horror movies. For example, stills or animated
        gifs from horror movies that follow the standards for an R rating set by
        the MPAA. The administrators and moderators of Slasher reserve the right
        to remove any post at our discretion.
      </p>
      <h3 className="h4">Gore</h3>
      <p>
        Gore is safe to post here, at long as it abides by the other rules on
        Slasher.
      </p>
      <h3 className="h4">Real Death / Blood / Violence</h3>
      <p>
        Out of respect for the injured or dead and their families, images
        depicting real blood, death, and/or violence are not allowed.
      </p>
      <h3 className="h4">Bottom Line</h3>
      <p>Be cool to one another and have fun!</p>
    </div>
  );
}

CommunityStandardsAndRules.defaultProps = {
  className: '',
};

export default CommunityStandardsAndRules;
