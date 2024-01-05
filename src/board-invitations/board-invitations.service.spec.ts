import { Test, TestingModule } from '@nestjs/testing';
import { BoardInvitationsService } from './board-invitations.service';

describe('BoardInvitationsService', () => {
  let service: BoardInvitationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoardInvitationsService],
    }).compile();

    service = module.get<BoardInvitationsService>(BoardInvitationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
