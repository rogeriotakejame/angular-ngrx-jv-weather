import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Units } from 'src/app/shared/models/units.enum';
import { Weather } from 'src/app/shared/models/weather.model';
import { unitToSymbol } from 'src/app/shared/utils/units.utils';

@Component({
  selector: 'jv-detailed-weather',
  templateUrl: './detailed-weather.component.html',
  styleUrls: ['./detailed-weather.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailedWeatherComponent {

  @Input() weather: Weather;
  @Input() unit: Units;

  get weatherIcon(): string {
    return `http://openweathermap.org/img/wn/${this.weather.icon}@2x.png`;
  }

  get unitSymbol(): string {
    return unitToSymbol(this.unit);
  }
}
