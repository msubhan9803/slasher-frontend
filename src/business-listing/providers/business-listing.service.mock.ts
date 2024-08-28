export const mockBusinessListing = {
  _id: '66cb44d9ac2de28562e12e12',
  userRef: '66ca010e24eb72dcb347fc1d',
  businesstype: 'artist',
  listingType: '66cb3e23ac2de28562e1257e',
  businessLogo: 'http://localhost:4000/api/v1/local-storage/business-listing/business-listing_6b44257a-ae1f-4d2b-8e13-8d4e2e7b86a8.jpeg',
  coverPhoto: '/business-listing/business-listing_bca83ffa-2534-47fa-9f96-650a9b820b39.png',
  title: 'Horror NFT',
  overview: 'Horror NFT | Buy Now | Visit Website',
  isActive: true,
  bookRef: null,
  movieRef: null,
  email: 'mohammadsubhan9803@gmail.com',
  phoneNumber: '+923117085235',
  address: '',
  websiteLink: 'www.example.com',
  createdAt: '2024-08-25T14:51:05.043Z',
  updatedAt: '2024-08-25T14:51:05.043Z',
  __v: 0,
};

export const mockBusinessListingModel = {
    findById: jest.fn().mockResolvedValue(mockBusinessListing),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(mockBusinessListing),
};
