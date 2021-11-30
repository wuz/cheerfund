const { kebabCase } = require("lodash");

const styleString = (obj) => Object.entries(obj).map(([key, value]) => `${key[0] === "-" ? key : kebabCase(key)}: ${value};`).join("");

export default (primaryFirstName, primaryLastName) => `
    <div
      class="page"
      style="${styleString({
  height: "100%",
  width: "100%",
  position: "relative",
})}"
    >
      <p style="margin-top:5em">
        Dear ${primaryFirstName} ${primaryLastName},<br /><br />
        Your application for assistance from the Cheer Fund for 2021 has been received and approved.<br /> <br />

        <strong>PLEASE NOTE: </strong><br />
        Due to the continuing spread of Covid-19 and in the interest of safety for everyone, the Cheer Fund will NOT be delivering to your home on Christmas Eve. <br /><br />
        Instead, <strong>you will need to pick your items up at the Decatur County Fairgrounds on Saturday, December 11 from 10 am - 1 pm.</strong>
        Please follow the directions below for a contactless delivery of your items.<br /><br />
        <ol>
        <li>
        Enter the Fairgrounds/City Park area using the SR 46 entrance. Follow the signs and the directions of the traffic controllers.
        You will be asked for your name and to see this letter.
        <strong>IF YOU DO NOT HAVE THIS LETTER, YOU WILL NOT BE ABLE TO PICK UP YOUR ITEMS. COPIES WILL NOT BE ACCEPTED.</strong>
        You may designate a friend or family member to pick up your items, but they must have this letter with a note signed by you to pick up.
        </li>
        <li>
          Continue to follow the directions around to the entrance to the livestock barn. You will pull into the livestock barn where the Cheer 
          Fund volunteers will load food items and an envelope with a Visa and/or grocery gift card into your trunk or the back of your SUV or van.
          Please have this space cleared for the volunteer to easily place your items.
        </li>
        <li>
          When directed, continue to pull forward through the barn and out onto the road. Turn right onto Park Road to leave the fairgrounds.
        </li>
        </ol>
        <strong>There will be no toys given out this year.</strong>
        The items you will receive will be basic food supplies (milk, eggs, peanut butter, jelly, etc.) and Visa and/or grocery gift cards.
        You may use these gift cards to purchase toys, food and clothing, as needed for your child(ren). <br /><br />
        The Cheer Fund hopes to operate as normal in 2022. This year’s change was made to help keep everyone in Decatur County safe and healthy.<br /><br />
        If you have questions, please address those to DailyNewsCheerFund@gmail.com or call 812-651-0871 or 812-651-0884.<br /><br />   

        Please know that the Cheer Fund Committee volunteers wish you and yours a Merry Christmas and a Happy New Year! May 2022 bring blessings upon you!<br /><br />

        The Greensburg Daily News Cheer Fund Committee
      </p>
      <div
        style="${styleString({
  fontSize: "80px",
  fontWeight: "700",
  position: "absolute",
  top: "40%",
  left: "50%",
  "-webkit-transform": "translate(-50%, -50%) rotate(-20deg)",
  boxSizing: "border-box",
  opacity: "0.1",
  color: "#02B8F2",
})}"
      >
        CHEERFUND
      </div>
    </div>
  `