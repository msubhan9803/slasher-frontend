/* eslint-disable no-console */
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createApp } from './createApp';
import { MatchListDocument, MatchList } from '../src/schemas/matchList/matchList.schema';
import { Message, MessageDocument } from '../src/schemas/message/message.schema';
import { Chat, ChatDocument } from '../src/schemas/chat/chat.schema';

async function cleanUpMatchListsWithNoMessages(app: INestApplication) {
  const matchListModel = app.get<Model<MatchListDocument>>(getModelToken(MatchList.name));
  const chatModel = app.get<Model<ChatDocument>>(getModelToken(Chat.name));
  const messageModel = app.get<Model<MessageDocument>>(getModelToken(Message.name));

  let matchListProcessingCounter = 0;
  let numberOfMatchListsWithZeroMessages = 0;
  let numberOfZeroMessageMatchListsThatAreDeleted = 0;

  console.time('timer');

  const targetDocsQuery = {
    // participants: { $in: [new mongoose.Types.ObjectId('user-id-here')] },
    deletefor: { $exists: false },
  };
  const numDocsToTarget = await matchListModel.countDocuments(targetDocsQuery);
  console.log(`Docs to target: ${numDocsToTarget}`);

  const matchListSearchCursor = matchListModel.find(targetDocsQuery).sort({ _id: 1 }).cursor();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // if (matchListProcessingCounter === 2) { break; } // This just stops us from going through all records (for development efficiency)
    const matchListDoc = await matchListSearchCursor.next();
    if (!matchListDoc) { break; }
    matchListProcessingCounter += 1;

    // console.log(doc._id);
    // Get number of messages associated with this matchlist
    const messageCount = await messageModel.countDocuments({ matchId: matchListDoc._id });
    if (messageCount === 0) {
      numberOfMatchListsWithZeroMessages += 1;
      if (matchListDoc.deleted) {
        numberOfZeroMessageMatchListsThatAreDeleted += 1;
      }
      // Since this matchList has no associated messages, mark it as deletefor for all participants
      // console.log(`No messages for matchList ${matchListDoc._id}, so would have set deletefor to: ${matchListDoc.participants}`);
      await matchListModel.findOneAndUpdate(
        { _id: matchListDoc._id },
        { $set: { deletefor: matchListDoc.participants } },
        { timestamps: false }, // do not modify timestamps as part of this update
      );
    } else {
      // Since this matchList HAS messages, transfer its deletefor status from any associated chat model object
      const associatedChat = await chatModel.findOne({ matchId: matchListDoc._id });
      const newDeleteforValue = associatedChat ? associatedChat.deletefor : [];
      // console.log(`Messages found (chat found = ${associatedChat ? 'true' : 'false'}) matchList ${matchListDoc._id}, `
      //   + `so would have set chat-based deletefor to: ${newDeleteforValue}`);
      await matchListModel.findOneAndUpdate(
        { _id: matchListDoc._id },
        { $set: { deletefor: newDeleteforValue } },
        { timestamps: false }, // do not modify timestamps as part of this update
      );
    }

    // Only print out periodic progress updates because console logging slows things down
    if (matchListProcessingCounter % 1000 === 0) {
      console.log(`Processed: ${matchListProcessingCounter}`);
    }
  }

  console.log(`Done. Searched through ${matchListProcessingCounter} matchLists.`);
  console.log(`numberOfMatchListsWithZeroMessages: ${numberOfMatchListsWithZeroMessages}`);
  console.log(`numberOfZeroMessageMatchListsThatAreDeleted: ${numberOfZeroMessageMatchListsThatAreDeleted}`);
  console.timeEnd('timer');
}

(async () => {
  const app = await createApp();
  await cleanUpMatchListsWithNoMessages(app);
  app.close();
})();
