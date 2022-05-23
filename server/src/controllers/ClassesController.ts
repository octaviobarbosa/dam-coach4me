import { Request, Response } from 'express';

import db from '../database/connection';
import convertHourToMinutes from '../utils/convertHourToMinutes';

interface ScheduleItem {
  week_day: number;
  from: string;
  to: string;
}

export default class ClassesController {
  async index(request: Request, response: Response) {
    const filters = request.query;

    const week_day = filters.week_day as string;
    const subject = filters.subject as string;
    const time = filters.time as string;

    if ((!filters.week_day) || (!filters.subject) || (!filters.time)) {
      return response.status(400).json({
        error: 'Missing filters to search classes'
      });
    }
  
    const timeInMinutes = convertHourToMinutes(time);

    const classes = await db('classes')
      .whereExists(function() {
        this.select('class_schedule.*')
          .from('class_schedule')
          .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
          .whereRaw('`class_schedule`.`week_day` = ??', [Number(week_day)])
          .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
          .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes])
      })
      .join('coaches', 'classes.coach_id', '=', 'coaches.id')
      .where('classes.subject', '=', subject)
      .select([
        'classes.id as class_id',
        'classes.*',
        'coaches.*',
      ]);

    const classesWithSchedule = []
    for(const item of classes) {
      const schedules = await db('class_schedule').where('class_schedule.class_id', '=', item.class_id)

      classesWithSchedule.push({
        ...item,
        schedules
      })
    }

    return response.json(classesWithSchedule);
  }
  
  async create(request: Request, response: Response) {
    const {
      name,
      avatar,
      whatsapp,
      bio,
      subject,
      cost,
      schedule
    } = request.body;
  
    const trx = await db.transaction();
  
    try {
      const insertedCoachesIds = await trx('coaches').insert({
        name,
        avatar,
        whatsapp,
        bio,
      });
    
      const coach_id = insertedCoachesIds[0];
    
      const insertedClassesIds = await trx('classes').insert({
        subject,
        cost,
        coach_id,
      });
    
      const class_id = insertedClassesIds[0];
    
      const classSchedule = schedule.map((scheduleItem: ScheduleItem) => {
        return {
          class_id,
          week_day: scheduleItem.week_day,
          from: convertHourToMinutes(scheduleItem.from),
          to: convertHourToMinutes(scheduleItem.to),
        };
      });
    
      await trx('class_schedule').insert(classSchedule);
    
      await trx.commit();
    
      return response.status(201).send();
    } catch (err) {
      await trx.rollback();
  
      return response.status(400).json({
        error: 'Unexpected error while creating new class'
      });
    }
  }
}