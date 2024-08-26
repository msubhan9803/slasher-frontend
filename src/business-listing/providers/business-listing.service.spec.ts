/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../app.module';
import { BusinessListing } from '../../schemas/businessListing/businessListing.schema';
import { UserDocument } from '../../schemas/user/user.schema';
import { businessListingFactory } from '../../../test/factories/businessListing.factory';
import { rewindAllFactories } from '../../../test/helpers/factory-helpers.ts';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { BusinessListingService } from './business-listing.service';
import { UsersService } from '../../users/providers/users.service';
import { userFactory } from '../../../test/factories/user.factory';
import { businessListingTypeFactory } from '../../../test/factories/businessListingType.factory';
import { BusinessListingType } from '../../schemas/businessListingType/businessListingType.schema';

describe('BusinessListingService', () => {
  let app: INestApplication;
  let connection: Connection;
  let businessListingService: BusinessListingService;
  let usersService: UsersService;
  // let businessListingModel: Model<BusinessListing>;
  let businessListing: BusinessListing;
  let businessListingType: BusinessListingType;
  let activeUser: UserDocument;
  let user1: UserDocument;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    connection = moduleRef.get<Connection>(getConnectionToken());
    businessListingService = moduleRef.get<BusinessListingService>(BusinessListingService);
    // businessListingModel = moduleRef.get<Model<BusinessListing>>(getModelToken(BusinessListing.name));
    usersService = moduleRef.get<UsersService>(UsersService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    // Reset sequences so we start fresh before each test
    rewindAllFactories();

    activeUser = await usersService.create(
      userFactory.build({ userName: 'superman1' }),
    );
    user1 = await usersService.create(
      userFactory.build({ userName: 'Michael' }),
    );

    const {
      name,
      label,
      features,
      price,
    } = businessListingTypeFactory.build();
    businessListingType = await businessListingService.createListingType({
      name,
      label,
      features,
      price,
    });

    // Create a sample business listing for use in tests
    const tempBusienssListing = businessListingFactory.build();
    tempBusienssListing.userRef = activeUser._id;
    tempBusienssListing.listingType = businessListingType._id;

    businessListing = await businessListingService.createListing(tempBusienssListing);
  });

  it('should be defined', () => {
    expect(businessListingService).toBeDefined();
  });

  describe('#checkPreparation', () => {
    it('business listing should be defined ✅', () => {
      expect(businessListing).toBeDefined();
    });
    it('active user should be defined ✅', () => {
      expect(activeUser).toBeDefined();
    });
    it('user 1 should be defined ✅', () => {
      expect(user1).toBeDefined();
    });
  });

  describe('#createListing', () => {
    it('successfully creates a business listing', async () => {
      const createdListing = await businessListingService.findOne(businessListing._id.toString());
      expect(createdListing).toBeTruthy();
      expect(createdListing.title).toEqual(businessListing.title);
    });
  });

  describe('#updateListing', () => {
    it('finds the expected business listing and updates the details', async () => {
      const updateData = {
        title: 'Updated Business Title',
        address: '4567 Updated St, Suite 2',
      };
      const updatedListing = await businessListingService.update(businessListing._id.toString(), updateData);
      expect(updatedListing.title).toEqual(updateData.title);
      expect(updatedListing.address).toEqual(updateData.address);
    });
  });

  describe('#findById', () => {
    it('finds the expected business listing details', async () => {
      const foundListing = await businessListingService.findOne(businessListing._id.toString());
      expect(foundListing.title).toEqual(businessListing.title);
    });
  });
});
