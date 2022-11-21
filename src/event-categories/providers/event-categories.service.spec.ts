import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { EventCategoryDocument } from '../../schemas/eventCategory/eventCategory.schema';
import { eventCategoryFactory } from '../../../test/factories/event-category.factory';
import { AppModule } from '../../app.module';
import { EventCategoriesService } from './event-categories.service';
import { EventCategoryDeletionState, EventCategoryStatus } from '../../schemas/eventCategory/eventCategory.enums';
import { dropCollections } from '../../../test/helpers/mongo-helpers';

describe('EventCategoriesService', () => {
  let app: INestApplication;
  let connection: Connection;
  let eventCategoriesService: EventCategoriesService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());
    eventCategoriesService = moduleRef.get<EventCategoriesService>(EventCategoriesService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await dropCollections(connection);
  });

  it('should be defined', () => {
    expect(eventCategoriesService).toBeDefined();
  });

  describe('#create', () => {
    it('successfully creates a event category', async () => {
      const eventCategoryData = eventCategoryFactory.build();
      const eventCategory = await eventCategoriesService.create(eventCategoryData);
      expect(await eventCategoriesService.findById(eventCategory._id, false)).toBeTruthy();
    });
  });

  describe('#update', () => {
    let event: EventCategoryDocument;
    beforeEach(async () => {
      event = await eventCategoriesService.create(
        eventCategoryFactory.build(),
      );
    });
    it('finds the expected event category and update the details', async () => {
      const eventData = {
        event_name: 'Event test 20',
        status: EventCategoryStatus.Inactive,
      };
      const updatedEvent = await eventCategoriesService.update(event._id, eventData);
      const reloadedEvent = await eventCategoriesService.findById(updatedEvent._id, false);
      expect(reloadedEvent.event_name).toEqual(eventData.event_name);
      expect(reloadedEvent.status).toEqual(eventData.status);
      expect(reloadedEvent.is_deleted).toEqual(event.is_deleted);
    });
  });

  describe('#findById', () => {
    let eventCategory: EventCategoryDocument;
    beforeEach(async () => {
      eventCategory = await eventCategoriesService.create(
        eventCategoryFactory.build(),
      );
    });
    it('finds the expected event category details', async () => {
      const eventCategoryDetail = await eventCategoriesService.findById(eventCategory._id, false);
      expect(eventCategoryDetail.event_name).toEqual(eventCategory.event_name);
    });

    it('finds the expected event category details that has not deleted and active status', async () => {
      const deletedEventCategory = await eventCategoriesService.create(
        eventCategoryFactory.build({
          is_deleted: EventCategoryDeletionState.Deleted,
          status: EventCategoryStatus.Inactive,
        }),
      );

      const eventCategoryDetail = await eventCategoriesService.findById(deletedEventCategory._id, true);
      expect(eventCategoryDetail).toBeNull();
    });
  });

  describe('#findAll', () => {
    beforeEach(async () => {
      for (let index = 0; index < 10; index += 1) {
        await eventCategoriesService.create(
          eventCategoryFactory.build(),
        );
        await eventCategoriesService.create(
          eventCategoryFactory.build({
            is_deleted: EventCategoryDeletionState.Deleted,
            status: EventCategoryStatus.Inactive,
          }),
        );
      }
    });

    it('finds all the expected event category details', async () => {
      const allEventCategoryList = await eventCategoriesService.findAll(false);
      for (let index = 1; index < allEventCategoryList.length; index += 1) {
        expect(allEventCategoryList[index - 1].event_name < allEventCategoryList[index].event_name).toBe(true);
      }
      expect(allEventCategoryList).toHaveLength(20);
    });

    it('finds all the expected event category details that has not deleted and active status', async () => {
      const eventCategoryList = await eventCategoriesService.findAll(true);
      for (let index = 1; index < eventCategoryList.length; index += 1) {
        expect(eventCategoryList[index - 1].event_name < eventCategoryList[index].event_name).toBe(true);
      }
      expect(eventCategoryList).toHaveLength(10);
    });
  });
});
