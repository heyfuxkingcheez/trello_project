import { Test, TestingModule } from '@nestjs/testing';
import { BoardInvitationsController } from './board-invitations.controller';

describe('BoardInvitationsController', () => {
  let controller: BoardInvitationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardInvitationsController],
    }).compile();

    controller = module.get<BoardInvitationsController>(BoardInvitationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
