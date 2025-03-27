import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Req,
  } from '@nestjs/common';
  import { ExerciseService } from './exercise.service';
  import { CreateExerciseDto } from './dto/createExercise.dto';
  import { UpdateExerciseDto } from './dto/updateExercise.dto';
  import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
  import {
    ApiOperation,
    ApiResponse,
    ApiTags,
    ApiParam,
    ApiBody,
    ApiQuery,
  } from '@nestjs/swagger';
  
  @ApiTags('Exercises')
  @UseGuards(JwtAuthGuard)
  @Controller('exercises')
  export class ExerciseController {
    constructor(private readonly exerciseService: ExerciseService) {}
  
    @Post()
    @ApiOperation({ summary: 'Create a new exercise' })
    @ApiBody({ type: CreateExerciseDto })
    @ApiResponse({
      status: 201,
      description: 'The exercise has been successfully created.',
    })
    create(@Body() createExerciseDto: CreateExerciseDto, @Req() req) {
      return this.exerciseService.create(createExerciseDto, req.user);
    }
  
    @Patch(':id')
    @ApiOperation({ summary: 'Update an existing exercise' })
    @ApiParam({ name: 'id', description: 'Exercise ID' })
    @ApiBody({ type: UpdateExerciseDto })
    @ApiResponse({
      status: 200,
      description: 'The exercise has been successfully updated.',
    })
    update(
      @Param('id') id: string,
      @Body() updateExerciseDto: UpdateExerciseDto,
      @Req() req,
    ) {
      return this.exerciseService.update(+id, updateExerciseDto, req.user);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Delete an exercise' })
    @ApiParam({ name: 'id', description: 'Exercise ID' })
    @ApiResponse({
      status: 200,
      description: 'The exercise has been successfully deleted.',
    })
    remove(@Param('id') id: string, @Req() req) {
      return this.exerciseService.delete(+id, req.user);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get a list of all exercises' })
    @ApiQuery({
      name: 'name',
      required: false,
      type: String,
      description: 'Filter exercises by name',
    })
    @ApiResponse({
      status: 200,
      description: 'List of exercises retrieved successfully.',
    })
    findAll(@Query() query, @Req() req) {
      return this.exerciseService.findAll(req.user, query);
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get details of a specific exercise' })
    @ApiParam({ name: 'id', description: 'Exercise ID' })
    @ApiResponse({
      status: 200,
      description: 'Details of the exercise retrieved successfully.',
    })
    findOne(@Param('id') id: string, @Req() req) {
      return this.exerciseService.findOne(+id, req.user);
    }
  
    @Post(':id/favorite')
    @ApiOperation({ summary: 'Favorite an exercise' })
    @ApiParam({ name: 'id', description: 'Exercise ID' })
    @ApiResponse({
      status: 200,
      description: 'The exercise has been added to favorites.',
    })
    favorite(@Param('id') id: string, @Req() req) {
      return this.exerciseService.favoriteExercise(+id, req.user);
    }
  
    @Post(':id/save')
    @ApiOperation({ summary: 'Save an exercise' })
    @ApiParam({ name: 'id', description: 'Exercise ID' })
    @ApiResponse({
      status: 200,
      description: 'The exercise has been saved.',
    })
    save(@Param('id') id: string, @Req() req) {
      return this.exerciseService.saveExercise(+id, req.user);
    }
  
    @Post(':id/rate')
    @ApiOperation({ summary: 'Rate an exercise' })
    @ApiParam({ name: 'id', description: 'Exercise ID' })
    @ApiBody({ type: Number, description: 'The rating value (1-5)' })
    @ApiResponse({
      status: 200,
      description: 'The exercise has been rated successfully.',
    })
    rate(@Param('id') id: string, @Body('value') value: number, @Req() req) {
      return this.exerciseService.rateExercise(+id, req.user, value);
    }
  }
  