import {BaseComponent, Button, Container, Flex, Grid, GridItem, HtmlLabel} from '../../../src';

describe('Container typing', () => {
  it('preserves concrete return types for generated add.* methods', () => {
    const container = new Container();
    const flex = new Flex();
    const grid = new Grid();

    const childFlex = container.add.Flex({});
    const childGrid = container.add.Grid({});
    const childGridItem = container.add.GridItem({});

    const nestedFlex = flex.add.Flex({});
    const nestedGrid = grid.add.Grid({});
    const nestedGridItem = grid.add.GridItem({});

    const flexButton = childFlex.add.Button({text: 'flex button'});
    const gridButton = childGrid.add.Button({text: 'grid button'});
    const gridItemButton = childGridItem.add.Button({text: 'grid item button'});
    const nestedFlexButton = nestedFlex.add.Button({text: 'nested flex button'});
    const nestedGridItemButton = nestedGrid.add.GridItem({}).add.Button({text: 'nested grid item button'});
    const nestedGridButton = nestedGridItem.add.Button({text: 'nested grid item button'});
    const htmlLabel = container.add.HtmlLabel({html: '<strong>typed</strong>'});
    const bindableInput = container.add.Input({
      bind: {
        value: 'form.email',
      },
    });

    const typedContainer: Container = childFlex;
    const typedFlex: Flex = nestedFlex;
    const typedGrid: Grid = nestedGrid;
    const typedGridItem: GridItem = nestedGridItem;
    const typedButton: Button = flexButton;
    const typedHtmlLabel: HtmlLabel = htmlLabel;
    const typedBase: BaseComponent = gridButton;

    void typedContainer;
    void typedFlex;
    void typedGrid;
    void typedGridItem;
    void typedButton;
    void typedHtmlLabel;
    void typedBase;
    void gridItemButton;
    void nestedFlexButton;
    void nestedGridItemButton;
    void nestedGridButton;
    void bindableInput;

    expect(childFlex).toBeInstanceOf(Flex);
    expect(childGrid).toBeInstanceOf(Grid);
    expect(childGridItem).toBeInstanceOf(GridItem);
    expect(nestedFlexButton).toBeInstanceOf(Button);
  });
});

