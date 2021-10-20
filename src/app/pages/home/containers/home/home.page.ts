import { ApplicationRef, Component, ComponentFactoryResolver, Injector, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable, Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { Bookmark } from 'src/app/shared/models/bookmark.model';
import { CityWeather } from 'src/app/shared/models/weather.model';
import * as fromHomeActions from '../../state/home.actions';
import * as fromHomeSelectors from '../../state/home.selectors';
import * as fromBookmarksSelectors from 'src/app/pages/bookmarks/state/bookmarks.selectors';
import * as fromConfigSelectors from 'src/app/shared/state/config/config.selectors';
import { CityTypeaheadItem } from 'src/app/shared/models/city-typeahead-item.model';
import { PortalOutlet, DomPortalOutlet, ComponentPortal } from '@angular/cdk/portal';  
import { UnitSelectorComponent } from '../unit-selector/unit-selector.component';
import { Units } from 'src/app/shared/models/units.enum';

@Component({
  selector: 'jv-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit, OnDestroy {

  cityWeather$: Observable<CityWeather>;
  cityWeather: CityWeather;
  loading$: Observable<boolean>;
  error$: Observable<boolean>;

  bookmarksList$: Observable<Bookmark[]>;
  isCurrentFavorite$: Observable<boolean>;


  searchControl: FormControl;
  searchControlWithAutocomplete: FormControl;

  unit$: Observable<Units>;

  text: string;

  private componentDestroyed$ = new Subject();
  
  private portalOutlet: PortalOutlet;
  constructor(
    private store:Store,
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
  ) {

  }

  ngOnInit(): void {
    this.searchControl = new FormControl('', Validators.required);
    this.searchControlWithAutocomplete = new FormControl(undefined);
    this.searchControlWithAutocomplete.valueChanges
      .pipe(takeUntil(this.componentDestroyed$))
      .subscribe((value: CityTypeaheadItem) => {
        if(!!value) {
          this.store.dispatch(fromHomeActions.loadCurrentWeatherById({id: value.geonameid.toString()}))
        }
      });
    /*this.store.pipe(select(fromHomeSelectors.selectHomeText))
    .subscribe(text => this.text = text);*/

    this.cityWeather$ = this.store.pipe(select(fromHomeSelectors.selectCurrentWeather));
    this.cityWeather$
      .pipe(takeUntil(this.componentDestroyed$))
      .subscribe(value => this.cityWeather = value);

    this.loading$ = this.store.pipe(select(fromHomeSelectors.selectCurrentWeatherLoading));
    this.error$ = this.store.pipe(select(fromHomeSelectors.selectCurrentWeatherError));

    this.bookmarksList$ = this.store.pipe(select(fromBookmarksSelectors.selectBookmarksList));
    this.isCurrentFavorite$ = combineLatest([this.cityWeather$, this.bookmarksList$])
      .pipe(
        tap(x=>console.log(x)),
        map(([current, bookmarksList]) => {
          if (!!current) {
            return bookmarksList.some(bookmark => bookmark.id === current.city.id);
          }
          return false;
        }),
      );

    this.unit$ = this.store.pipe(select(fromConfigSelectors.selectUnitConfig));

    this.setupPortal();
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();
    this.store.dispatch(fromHomeActions.clearHomeState());
    this.portalOutlet.detach();
  }
  doSearch(){
    /*const text = this.searchControl.value;
    this.store.dispatch(fromHomeActions.changeText({text}));*/
    const query = this.searchControl.value;
    this.store.dispatch(fromHomeActions.loadCurrentWeather({ query }));
  }

  onToggleBookmark() {
    const bookmark = new Bookmark();
    bookmark.id = this.cityWeather.city.id;
    bookmark.name = this.cityWeather.city.name;
    bookmark.country = this.cityWeather.city.country;
    bookmark.coord = this.cityWeather.city.coord;
    this.store.dispatch(fromHomeActions.toggleBookmark({ entity: bookmark }));
  }

  private setupPortal() {
    const el = document.querySelector('#navbar-portal-outlet');
    this.portalOutlet = new DomPortalOutlet(
      el,
      this.componentFactoryResolver,
      this.appRef,
      this.injector,
    );
    this.portalOutlet.attach(new ComponentPortal(UnitSelectorComponent));
  }
}
