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
import { BusinessType } from '../../schemas/businessListing/businessListing.enums';

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

  describe('#getAllListings', () => {
    it('retrieves all active business listings', async () => {
      const listings = await businessListingService.getAllListings(null);

      expect(listings).toBeTruthy();
      expect(listings.length).toBeGreaterThan(0);
      expect(listings[0].isActive).toBe(true);
    });

    it('retrieves sepecific business listing with pagination', async () => {
      const listings = await businessListingService.getAllListings(BusinessType.ARTIST);

      expect(listings).toBeTruthy();
      expect(listings.length).toBeGreaterThan(0);
      expect(listings[0].isActive).toBe(true);
    });
  });

  describe('#getAllListingsForAdmin', () => {
    it('retrieves all business listings for admin', async () => {
      const listings = await businessListingService.getAllListingsForAdmin(null);

      expect(listings).toBeTruthy();
      expect(listings.length).toBeGreaterThan(0);
    });
  });

  describe('#getAllMyListings', () => {
    it('retrieves all listings associated with a user', async () => {
      const listings = await businessListingService.getAllMyListings(activeUser._id.toString());

      expect(listings).toBeTruthy();
      expect(listings.length).toBeGreaterThan(0);
      expect(listings[0].userRef.toString()).toEqual(activeUser._id.toString());
    });
  });

  describe('#getAllListingTypes', () => {
    it('retrieves all business listing types', async () => {
      const listingTypes = await businessListingService.getAllListingTypes();

      expect(listingTypes).toBeTruthy();
      expect(listingTypes.length).toBeGreaterThan(0);
      expect(listingTypes[0].name).toEqual(businessListingType.name);
    });
  });

  describe('#createListingType', () => {
    it('successfully creates a business listing type', async () => {
      const {
        name,
        label,
        features,
        price,
      } = businessListingTypeFactory.build();
      const createdListingType = await businessListingService.createListingType({
        name,
        label,
        features,
        price,
      });

      expect(createdListingType).toBeTruthy();
      expect(createdListingType.name).toEqual(name);
      expect(createdListingType.features).toEqual(features);
    });
  });

  describe('#update', () => {
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

  describe('#findOne', () => {
    it('finds the expected business listing details', async () => {
      const foundListing = await businessListingService.findOne(businessListing._id.toString());
      expect(foundListing.title).toEqual(businessListing.title);
    });
  });

  describe('#updateAll', () => {
    it('updates all fields of a business listing', async () => {
      const updateData = businessListingFactory.build();
      const updatedListing = await businessListingService.updateAll(businessListing._id.toString(), updateData as BusinessListing);

      expect(updatedListing).toBeTruthy();
      expect(updatedListing.title).toEqual(updateData.title);
      expect(updatedListing.overview).toEqual(updateData.overview);
      expect(updatedListing.isActive).toEqual(updateData.isActive);
    });
  });
});
